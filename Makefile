ENV_FILE_PATH = .env.sample
ENV_LOCAL_FILE_PATH = .env.sample.local
DOCKER_COMPOSE = docker compose --env-file ${ENV_FILE_PATH} -f ./docker-compose.yml
CERT_SCRIPT_DIR = ./reverseproxy/tools
CERT_DIR = ./reverseproxy/ssl

ifdef WITH_LOCAL
	DOCKER_COMPOSE = docker compose --env-file ${ENV_LOCAL_FILE_PATH} -f ./docker-compose.local.yml
endif

local:
	$(MAKE) WITH_LOCAL=1 run

run: build up

build:
	$(DOCKER_COMPOSE) build

up: cert
	$(DOCKER_COMPOSE) up -d

fdown:
	$(DOCKER_COMPOSE) down -v

down:
	$(DOCKER_COMPOSE) down

image-prune:
	docker image prune -f

ps:
	docker ps

PHONY: run re build up down fdown image-prune ps generate

# -- 証明書の作成
cert:
	@if [ ! -d "$(CERT_DIR)" ]; then \
		make -C $(CERT_SCRIPT_DIR); \
	else \
		echo "certificates already exist"; \
	fi

cert_clean:
	rm -rf $(CERT_DIR)

PHONY:generate cert
