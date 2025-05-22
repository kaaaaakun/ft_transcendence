CERT_SCRIPT_DIR = ./reverseproxy/tools
CERT_DIR = ./reverseproxy/ssl

ifdef WITH_LOCAL
  ENV_PATH        = ./.env.sample.local
  COMPOSE_YML     = ./docker-compose.local.yml
else
  ENV_PATH        = ./.env.sample
  COMPOSE_YML     = ./docker-compose.yml
endif

DOCKER_COMPOSE = docker compose --env-file $(ENV_PATH) -f $(COMPOSE_YML) #-f ./elk/docker-compose.yml

all: run

local:
	$(MAKE) WITH_LOCAL=1 run

run: build up

re: down image-prune run

build:
	$(DOCKER_COMPOSE) build

up: cert # setup-elk
	$(DOCKER_COMPOSE) up -d

fdown:
	$(DOCKER_COMPOSE) rm --stop --force # setup
	$(DOCKER_COMPOSE) down -v

down:
	$(DOCKER_COMPOSE) down

image-prune:
	docker image prune -f

ps:
	docker ps

setup-elk:
	$(DOCKER_COMPOSE) up setup

PHONY: run re build up down fdown image-prune ps generate setup-elk

# -- 証明書の作成
cert:
	@if [ ! -d "$(CERT_DIR)" ]; then \
		make -C $(CERT_SCRIPT_DIR); \
	else \
		echo "certificates already exist"; \
	fi

cert_clean:
	rm -rf $(CERT_DIR)

PHONY:cert
