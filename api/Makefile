.PHONY: up down ps

# docker-compose.ymlがあるディレクトリのパス
DOCKER_COMPOSE_DIR = .
DOCKER_COMPOSE_FILE = $(DOCKER_COMPOSE_DIR)/docker-compose.yml

up: build
	docker compose --env-file .env.sample -f $(DOCKER_COMPOSE_FILE) up -d

down:
	docker compose --env-file .env.sample -f $(DOCKER_COMPOSE_FILE) down -v

# 古いイメージを削除
image-prune:
	docker image prune -f

# cacheを使わずにビルド
build:
	docker compose --env-file .env.sample -f $(DOCKER_COMPOSE_FILE) build --no-cache

re:	down image-prune up
