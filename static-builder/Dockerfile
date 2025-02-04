# base stage
FROM node:20.14.0-alpine AS base

WORKDIR /usr/src/vite

RUN apk update && apk add --no-cache curl bash libc6-compat
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# development stage
FROM base AS development

WORKDIR /usr/src/vite

COPY ./static-builder/package.json ./static-builder/pnpm-lock.yaml ./shared-config/config.json ./


# build stage
FROM base AS build

ARG VITE_API_URL 
ARG VITE_WEBSOCKET_URL

WORKDIR /usr/src/vite

COPY ./static-builder/ ./shared-config/config.json ./

RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

RUN pnpm build
