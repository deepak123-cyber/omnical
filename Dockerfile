# Production Dockerfile for Google Cloud Run / Container deployment
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend dist
COPY . .
RUN npm run build

# Run unit tests to ensure integrity before deployment
RUN npm test

# Production stage
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose standard Cloud Run port
EXPOSE 8080

# Start server using tsx
CMD ["npm", "start"]
