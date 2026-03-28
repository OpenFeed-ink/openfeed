# syntax=docker/dockerfile:1
FROM node:23-alpine

LABEL org.opencontainers.image.source="https://github.com/OpenFeed-ink/openfeed"
LABEL org.opencontainers.image.description="Collect feedback, manage your roadmap, and publish changelog updates — all through one embeddable widget. Install once, control everything from your dashboard."
LABEL org.opencontainers.image.licenses="GPL-3.0"
LABEL org.opencontainers.image.title="OpenFeed-ink"
LABEL org.opencontainers.image.version="v0.1.0"
LABEL org.opencontainers.image.authors="Ali Amer <aliamer19ali@gmail.com>"

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install -g npm@11.12.0

RUN npm ci

COPY . .

# Add the entrypoint script to the container
COPY docker-entrypoint.sh /usr/local/bin/

# Make sure the entrypoint script is executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN npm run build

RUN cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/


# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create non-root user for running the app
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs
   
EXPOSE 8080

USER nextjs

ENTRYPOINT ["docker-entrypoint.sh"]

