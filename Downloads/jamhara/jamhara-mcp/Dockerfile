FROM node:20-slim
WORKDIR /app

# Install dependencies (including dev for TypeScript build)
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Clean dev dependencies after build
RUN npm prune --omit=dev

EXPOSE 3002
CMD ["node", "dist/index.js"]
