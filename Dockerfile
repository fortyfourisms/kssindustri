# ── Stage 1: Build ────────────────────────────────────────────
FROM node:25-alpine AS build

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .

# Build-time env: the API URL is baked into the static bundle.
# Passed via --build-arg in docker-compose / CI.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Stage 2: Serve static files (no nginx) ───────────────────
# Since the host already runs nginx as a reverse proxy,
# we only need a lightweight static file server inside the container.
FROM node:25-alpine AS production

# Install a tiny static file server
RUN npm install -g serve@latest

# Create a non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup

# Create app directory and set ownership
RUN mkdir -p /app && chown appuser:appgroup /app

WORKDIR /app

# Copy built assets from build stage
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 3090

# Healthcheck — serve listens on 3090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3090/ || exit 1

# -s = SPA mode (rewrites all routes to index.html)
# -l = listen port
CMD ["serve", "-s", "dist", "-l", "3090"]
