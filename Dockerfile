FROM oven/bun:1

WORKDIR /app

# Copy dependency files first for caching
COPY package.json ./

# Install dependencies (production focused but includes all for proxy)
RUN bun install

# Copy source and runtime files
COPY src/ ./src/
COPY bin/ ./bin/
COPY README.md ./
COPY scanner-dashboard.html ./

# For npm package compatibility
COPY --chmod=755 bin/claude-proxy-supervisor.sh /usr/local/bin/claude-proxy-supervisor

EXPOSE 3456

# Production defaults - overridden by env
ENV NODE_ENV=production
ENV CLAUDE_PROXY_PASSTHROUGH=1
ENV CLAUDE_PROXY_HOST=0.0.0.0
ENV CLAUDE_PROXY_PORT=3456

# Healthcheck using the proxy's /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3456/health || exit 1

# Use supervisor for auto-restart on crashes
CMD ["./bin/claude-proxy-supervisor.sh"]
