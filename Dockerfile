# ── Stage 1: Build ────────────────────────────────────────────
FROM oven/bun:1.0.5-alpine AS build

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

# Build-time env: the API URL is baked into the static bundle.
# Passed via --build-arg in docker-compose / CI.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN bun run build

# ── Stage 2: Serve static files (no nginx) ───────────────────
FROM oven/bun:1.0.5-alpine AS production

WORKDIR /app
# Set ownership before switching user
RUN chown bun:bun /app

# Switch to non-root user
USER bun

# Initialize a package and install serve locally
RUN bun init -y && \
    bun add serve@latest

# Copy built assets from build stage
COPY --from=build --chown=bun:bun /app/client/dist ./dist

EXPOSE 3090

# Healthcheck — serve listens on 3090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3090/ || exit 1

# -s = SPA mode (rewrites all routes to index.html)
# -l = listen port
CMD ["bunx", "serve", "-s", "dist", "-l", "3090"]
