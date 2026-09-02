# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifest first so deps are cached separately from source changes
COPY package*.json ./
RUN npm ci

# Build-time API URL — set in Railway's service Variables tab
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ---- Run stage ----
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Railway injects $PORT at runtime — serve must bind to it
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
