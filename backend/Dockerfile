FROM node:20.18.1-slim

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install dependencies using npm (lockfile generated locally)
RUN npm ci

# Copy the rest of the source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose Lava API port
EXPOSE 3010

# Start the dev server
CMD ["npm", "run", "dev"]
