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

PHONY: run re build up down fdown image-prune ps generate setup-elk ssh-setup ssh-clean ssh-show

# -- 証明書の作成
cert:
	@if [ ! -d "$(CERT_DIR)" ]; then \
		make -C $(CERT_SCRIPT_DIR); \
	else \
		echo "certificates already exist"; \
	fi

cert_clean:
	rm -rf $(CERT_DIR)

# -- ブロックチェーンSSH鍵の生成
SSH_DIR = ./ssh
SSH_KEYS_DIR = $(SSH_DIR)/keys

ssh-setup:
	@if [ ! -f "$(SSH_KEYS_DIR)/blockchain_dev_rsa" ]; then \
		echo "Generating SSH keys for blockchain development..."; \
		mkdir -p $(SSH_KEYS_DIR); \
		ssh-keygen -t rsa -b 4096 -f "$(SSH_KEYS_DIR)/blockchain_dev_rsa" -N "" -C "ft_transcendence_blockchain@$$(hostname)"; \
		chmod 600 $(SSH_KEYS_DIR)/blockchain_dev_rsa; \
		chmod 644 $(SSH_KEYS_DIR)/blockchain_dev_rsa.pub; \
		echo "SSH keys generated successfully!"; \
		echo "Public key:"; \
		cat $(SSH_KEYS_DIR)/blockchain_dev_rsa.pub; \
	else \
		echo "SSH keys already exist"; \
	fi

ssh-clean:
	@echo "Cleaning SSH keys..."
	@rm -rf $(SSH_DIR)
	@echo "SSH keys removed"

ssh-show:
	@if [ -f "$(SSH_KEYS_DIR)/blockchain_dev_rsa.pub" ]; then \
		echo "Current SSH public key:"; \
		cat $(SSH_KEYS_DIR)/blockchain_dev_rsa.pub; \
	else \
		echo "No SSH keys found. Run 'make ssh-setup' to generate."; \
	fi

PHONY:cert ssh-setup ssh-clean ssh-show
