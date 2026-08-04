FROM node:20-alpine AS builder
WORKDIR /app

# Build tools needed for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Production image ──────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Build tools needed for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy built artifacts directly from builder — no extra npm install needed
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/seed.js ./src/seed.js

EXPOSE 4000
CMD ["node", "dist/main.js"]
