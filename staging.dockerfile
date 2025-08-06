# Step 1: Install dependencies and build the Next.js app
FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app
# Install necessary OS deps
RUN apk add --no-cache libc6-compat
# Copy dependency definitions
COPY package.json package-lock.json* ./
# Install dependencies
RUN npm install --legacy-peer-deps
# Copy the rest of the project
COPY . .
# Copy environment file for frontend build
# Make sure .env.production exists in repo or generated before build
COPY .env.production .env.production
# Build the Next.js app
RUN npm run build
# Step 2: Use a minimal image for running the app
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# Copy only the necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]