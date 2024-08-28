DOCKER_COMPOSE = docker compose -f ./docker-compose.yml

all: run

run: build up

re: down image-prune run

build:
	$(DOCKER_COMPOSE) build --no-cache

up:
	$(DOCKER_COMPOSE) up -d

fdown:
	$(DOCKER_COMPOSE) down -v

down:
	$(DOCKER_COMPOSE) down

image-prune:
	docker image prune -f

ps:
	docker ps

PHONY: run re build up down fdown image-prune ps
