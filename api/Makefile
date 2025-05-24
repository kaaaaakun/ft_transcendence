.PHONY: up down ps build re cre test

# docker-compose.ymlがあるディレクトリのパス
DOCKER_COMPOSE_DIR = ./dev/
DOCKER_COMPOSE_FILE = $(DOCKER_COMPOSE_DIR)docker-compose.yml

# envファイルのPATH
ENV_FILE = $(DOCKER_COMPOSE_DIR).env.sample

up: build
	docker compose --env-file $(ENV_FILE) -f $(DOCKER_COMPOSE_FILE) up -d

down:
	docker compose --env-file $(ENV_FILE) -f $(DOCKER_COMPOSE_FILE) down

vdown:
	docker compose --env-file $(ENV_FILE) -f $(DOCKER_COMPOSE_FILE) down -v

# 古いイメージを削除
image-prune:
	docker image prune -f

# cacheを使わずにビルド
build:
	docker compose --env-file $(ENV_FILE) -f $(DOCKER_COMPOSE_FILE) build --no-cache

# ボリュームを削除しないので、DBのデータが残る
re:	down image-prune up

# DBごと削除する
cre: vdown image-prune up

test: up
	docker exec dev-api python manage.py test --noinput
