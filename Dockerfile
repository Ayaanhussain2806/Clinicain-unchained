# Dockerfile for Clinician-Unchained

FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/adaptive-level-forge-main
RUN pnpm install && pnpm run build

# Build backend
WORKDIR /app
RUN npm run build || true

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/adaptive-level-forge-main/dist ./adaptive-level-forge-main/dist

# Expose port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "index.js"]
