FROM node:20.18.1-slim

# Install OpenSSL — required by Prisma on slim images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps needed for tsc)
RUN npm ci

# Copy the rest of the source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# Expose Lava API port
EXPOSE 3010

# Run compiled JS — no ts-node-dev in production containers
CMD ["node", "dist/index.js"]
