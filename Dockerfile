FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all dependencies (build tools are in dependencies, not devDependencies)
RUN npm install

# Copy source
COPY . .

# Build the React client
RUN npm run build --workspace=client

EXPOSE 3001

CMD ["node", "server/src/index.js"]
