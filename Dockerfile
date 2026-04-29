# ── Stage 1: Build ────────────────────────────────────────────
FROM oven/bun:canary-alpine AS build

WORKDIR /app
# Set ownership before switching user
RUN chown bun:bun /app

# Switch to non-root user built into oven/bun
USER bun

# Install dependencies first (layer cache)
COPY --chown=bun:bun package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY --chown=bun:bun . .

# Build-time env for Vite.
# These values are read by `bun run build` and baked into the static bundle
# via `import.meta.env.*`.
ARG VITE_API_BASE_URL
ARG TURNSTILE_SITE_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY}

RUN bun run build

# ── Stage 2: Serve static files (no nginx) ───────────────────
FROM oven/bun:canary-alpine AS production

WORKDIR /app
# Set ownership before switching user
RUN chown bun:bun /app

# Switch to non-root user
USER bun

# Initialize a package and install serve locally
RUN bun init -y && \
    bun add serve@latest

# Runtime defaults in the final image.
# Container-level `-e/--env` values can still override these at startup.
# The startup command writes them into `dist/env-config.js` as `window._env_`.
ARG VITE_API_BASE_URL
ARG TURNSTILE_SITE_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY}

# Copy built assets from build stage
COPY --from=build --chown=bun:bun /app/client/dist ./dist

EXPOSE 3090

# Healthcheck — serve listens on 3090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3090/ || exit 1

# -s = SPA mode (rewrites all routes to index.html)
# -l = listen port
CMD sh -c "echo \"window._env_ = { VITE_API_BASE_URL: '${VITE_API_BASE_URL}', TURNSTILE_SITE_KEY: '${TURNSTILE_SITE_KEY}' };\" > dist/env-config.js && bunx serve -s dist -l 3090"
