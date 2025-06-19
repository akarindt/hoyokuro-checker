# Using a lightweight Node.js image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# ---

# Stage 1: Install all dependencies for building
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# ---

# Stage 2: Production image with only production dependencies
FROM base AS production
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Command to run the application
CMD ["node", "dist/src/index.js"]
