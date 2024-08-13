# base stage
FROM node:20.14.0-alpine AS base

WORKDIR /usr/src/vite

RUN apk update && apk add --no-cache curl bash libc6-compat
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate


# development stage
FROM base AS development

WORKDIR /usr/src/vite

COPY package.json pnpm-lock.yaml ./


# build stage
FROM base AS build

WORKDIR /usr/src/vite

COPY ./ ./

RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

RUN pnpm build
