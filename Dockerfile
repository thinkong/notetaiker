# ============================================
# NoteTAIker - Self-contained Docker Image
# ============================================
# Multi-stage build for optimized image size
# Includes: API server + Static web frontend
# ============================================

# ============================================
# Stage 1: Base with pnpm
# ============================================
FROM node:24-slim AS base

# Install pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Build (deps + compile)
# ============================================
FROM base AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/env/package.json ./packages/env/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the web frontend
RUN pnpm --filter @notetaiker/web build

# ============================================
# Stage 3: Production
# ============================================
FROM node:24-slim AS production

WORKDIR /app

# Copy workspace config
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy node_modules (with native deps pre-built)
COPY --from=builder /app/node_modules ./node_modules

# Copy API with its dependencies and source (tsx runs TypeScript directly)
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/src ./apps/api/src

# Copy shared packages (needed at runtime for imports)
COPY --from=builder /app/packages/env ./packages/env
COPY --from=builder /app/packages/tsconfig ./packages/tsconfig

# Copy built web frontend (static files)
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Create data directories
RUN mkdir -p /app/data/notes /app/.notetaiker

# Install wget for health checks
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs notetaiker && \
    chown -R notetaiker:nodejs /app

USER notetaiker

# Set environment variables
ENV NODE_ENV=production
ENV NOTES_DIR=/app/data/notes
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Run the API server using tsx (TypeScript runtime)
WORKDIR /app/apps/api
CMD ["npx", "tsx", "src/index.ts"]
