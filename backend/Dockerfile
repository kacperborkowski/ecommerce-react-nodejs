# Shared base: Node 22 with the same npm major version that generated package-lock.json
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@11.21.0

# Stage 1: compile TypeScript to JavaScript (needs dev dependencies like the Nest CLI)
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Stage 2: small production image with only runtime dependencies and compiled code
FROM base AS runtime
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Run as the unprivileged "node" user that comes with the official image
USER node

# Cloud Run sends traffic to the port from the PORT variable (8080 by default)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
