.PHONY: all
all: run

.PHONY: run
run: build up

.PHONY: re
re: destroy run

.PHONY: build
build:
	docker compose build

.PHONY: up
up: cert
	docker compose up -d

.PHONY: down
down:
	docker compose down

.PHONY: destroy
	destroy: docker compose down --rmi all --remove-orphans --volumes

.PHONY: ps
ps:
	docker ps

# -- 証明書の作成
CERT_SCRIPT_DIR = ./reverseproxy/tools
CERT_DIR = ./reverseproxy/ssl

.PHONY: cert
cert:
	@if [ ! -d "$(CERT_DIR)" ]; then \
		make -C $(CERT_SCRIPT_DIR); \
	else \
		echo "certificates already exist"; \
	fi

.PHONY: cert_clean
cert_clean:
	rm -rf $(CERT_DIR)
