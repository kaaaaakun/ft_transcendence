.PHONY: all
all: run

.PHONY: run
run: build up

.PHONY: re
re: down image-prune run

.PHONY: build
build:
	docker compose build

.PHONY: up
up: cert
	docker compose up -d

.PHONY: fdown
fdown:
	docker compose down -v

.PHONY: down
down:
	docker compose down

.PHONY: image-prune
image-prune:
	docker image prune -f

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
