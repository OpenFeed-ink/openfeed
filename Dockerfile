# syntax=docker/dockerfile:1

# ---- deps: install once, cached unless package.json/lock changes ----
FROM node:23-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install -g npm@11.12.0 && npm ci

# ---- builder: compile the production build ----
FROM node:23-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_PADDLE_ENV
ARG NEXT_PUBLIC_PADDLE_SUCCESSURL
ARG NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
ARG NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID
ARG NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID
ARG NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID
ARG NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_URL
ARG REDIS_URL

ENV NEXT_PUBLIC_PADDLE_ENV=${NEXT_PUBLIC_PADDLE_ENV}
ENV NEXT_PUBLIC_PADDLE_SUCCESSURL=${NEXT_PUBLIC_PADDLE_SUCCESSURL}
ENV NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=${NEXT_PUBLIC_PADDLE_CLIENT_TOKEN}
ENV NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID=${NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID}
ENV NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID=${NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID}
ENV NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID=${NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID}
ENV NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_URL=${NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_URL}
ENV REDIS_URL=${REDIS_URL}

# next build imports server modules for static analysis (route collection) —
# nothing in that phase makes a real auth/network call, but lib/auth.ts fails
# fast on a missing secret by design (no insecure fallback). This is a
# throwaway build-time value; the real secret is injected at runtime via Fly
# secrets, never baked into the image.
ENV BETTER_AUTH_SECRET=build-time-placeholder
ENV NODE_ENV=production

RUN npm run build

# ---- runner: slim runtime image — no source tree, no devDependencies ----
FROM node:23-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/OpenFeed-ink/openfeed"
LABEL org.opencontainers.image.description="Collect feedback, manage your roadmap, and publish changelog updates — all through one embeddable widget. Install once, control everything from your dashboard."
LABEL org.opencontainers.image.licenses="GPL-3.0"
LABEL org.opencontainers.image.title="OpenFeed-ink"
LABEL org.opencontainers.image.version="v0.1.0"
LABEL org.opencontainers.image.authors="Ali Amer <aliamer19ali@gmail.com>"

# Created before anything is copied in, so --chown below actually resolves —
# previously this user didn't exist yet at COPY time, so --chown silently
# no-op'd and the app ran as nextjs but everything on disk stayed root:root.
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Next's standalone output only traces what the app itself imports — static
# assets, the migrations folder, and the release-command script all need to
# be copied in explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs

RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

EXPOSE 8080

USER nextjs

CMD ["node", "server.js"]
