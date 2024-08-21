DOCKER_COMPOSE = docker compose -f ./docker-compose.yml

all: run

run:build up

re:down run

build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d

fdown:
	$(DOCKER_COMPOSE) down -v

down:
	$(DOCKER_COMPOSE) down

PHONY: run re build up down fdown
