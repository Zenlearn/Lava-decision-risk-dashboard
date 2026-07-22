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

# Run compiled JS — no ts-node-dev in production containers.
# --max-old-space-size: the Master Data import (~107K rows, 15MB+ file) parsed
# and scored entirely in-request will OOM on Node's default ~2GB heap — this
# was reproduced during local verification. 4096MB assumes the VM has at
# least ~6GB free for this container; lower it if the box is smaller (check
# `free -h` on the server first — see DEPLOYMENT.md).
CMD ["node", "--max-old-space-size=4096", "dist/index.js"]
