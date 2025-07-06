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
# 	docker network inspect net_pong >/dev/null 2>&1 || docker network create net_pong
# 	docker volume inspect vol_logs >/dev/null 2>&1 || docker volume create vol_logs
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

PHONY: run re build up down fdown image-prune ps generate setup-elk ssh-setup ssh-keygen ssh-config ssh-clean

# -- 証明書の作成
cert:
	@if [ ! -d "$(CERT_DIR)" ]; then \
		make -C $(CERT_SCRIPT_DIR); \
	else \
		echo "certificates already exist"; \
	fi

cert_clean:
	rm -rf $(CERT_DIR)

# -- ブロックチェーンSSH設定の自動生成
SSH_SCRIPTS_DIR = ./blockchain/ssh/scripts
SSH_KEYS_DIR = ./blockchain/ssh/keys

ssh-setup: ssh-keygen ssh-config

ssh-keygen:
	@echo "Generating SSH keys for blockchain environment..."
	@$(SSH_SCRIPTS_DIR)/generate-ssh-keys.sh -e dev
	@$(SSH_SCRIPTS_DIR)/generate-ssh-keys.sh -e staging
	@$(SSH_SCRIPTS_DIR)/generate-ssh-keys.sh -e prod

ssh-config:
	@echo "Generating SSH configuration for blockchain environment..."
	@$(SSH_SCRIPTS_DIR)/generate-ssh-config.sh -e all

ssh-clean:
	@echo "Cleaning SSH keys and configuration..."
	@rm -rf $(SSH_KEYS_DIR)
	@echo "SSH keys removed. Please manually remove SSH config entries from ~/.ssh/config if needed."

PHONY:cert ssh-setup ssh-keygen ssh-config ssh-clean
