# =================================================================
# CROSTI APP - MULTI-STAGE DOCKER BUILD
# =================================================================
# Optimized Next.js 16 production build with minimal image size
# Uses Alpine Linux for security and smaller footprint
# =================================================================

# -----------------------------------------------------------------
# STAGE 1: BASE - Common dependencies
# -----------------------------------------------------------------
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# -----------------------------------------------------------------
# STAGE 2: DEPENDENCIES - Install node modules
# -----------------------------------------------------------------
# -----------------------------------------------------------------
# STAGE 2: DEPENDENCIES - Install node modules
# -----------------------------------------------------------------
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --prod

# Install dev dependencies for build
RUN pnpm install

# -----------------------------------------------------------------
# STAGE 3: BUILDER - Build the application
# -----------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build args for Next.js public variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build the Next.js application
# The standalone output mode is configured in next.config.mjs
RUN npm install -g pnpm && pnpm run build

# -----------------------------------------------------------------
# STAGE 4: RUNNER - Production image
# -----------------------------------------------------------------
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create system user for security (non-root)
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with correct permissions
RUN mkdir .next && \
  chown nextjs:nodejs .next

# Copy Next.js standalone build
# This includes only necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

# =================================================================
# BUILD INSTRUCTIONS
# =================================================================
#
# Build the image:
#   docker build -t crosti-app:latest .
#
# Run the container:
#   docker run -p 3000:3000 --env-file .env.local crosti-app:latest
#
# Build for specific platform:
#   docker build --platform linux/amd64 -t crosti-app:latest .
#
# Multi-platform build:
#   docker buildx build --platform linux/amd64,linux/arm64 -t crosti-app:latest .
#
# Image size optimization:
#   - Uses Alpine Linux (minimal base)
#   - Multi-stage build removes build dependencies
#   - Next.js standalone output includes only necessary files
#   - Non-root user for security
#
# Expected image size: ~200-300MB (vs ~1GB+ without optimization)
#
# =================================================================
