# Stage 1: Build the application
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Run the application
FROM node:16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=develop

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Expose port 3000
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]