# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Set timezone to Indian Standard Time
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Production build
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["bun", "run", "src/index.ts"]
