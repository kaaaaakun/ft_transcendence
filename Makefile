ENV_FILE_PATH = .env.sample
DOCKER_COMPOSE = docker compose --env-file ${ENV_FILE_PATH} -f ./docker-compose.yml
CERT_SCRIPT_DIR = ./reverseproxy/tools
CERT_DIR = ./reverseproxy/ssl

ifdef WITH_LOCAL
	DOCKER_COMPOSE = docker compose --env-file ${ENV_FILE_PATH} -f ./docker-compose.local.yml
endif

all: run

local:
	$(MAKE) WITH_LOCAL=1 run

run: build up

re: down image-prune run

build:
	$(DOCKER_COMPOSE) build --no-cache

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

# -- OpenAPIを利用したコードの生成
OPENAPI_SPEC := openapi.yaml
OUTPUT_DIR := gen_openapi
LANGUAGE := javascript
DOCKER_IMAGE := openapitools/openapi-generator-cli

generate:
	docker run --rm \
	  -v $(PWD):/local \
	  $(DOCKER_IMAGE) generate \
	  -i /local/$(OPENAPI_SPEC) \
	  -g $(LANGUAGE) \
	  -o /local/$(OUTPUT_DIR)

clean:
	rm -rf $(OUTPUT_DIR)

# -- OpenAPIをもとにmockサーバーを立てる
mock:
	prism mock openapi.yaml

# -- AsyncAPIをもとにwebsoketmockサーバーを立てる
mock-init:
	cp -f asyncapi.yaml mock-server/
	# async-serverディレクトリが存在しない場合にのみ実施
	mkdir mock-server/async-server
	docker build -t asyncapi-generator mock-server/ && \
	docker run --name asyncapi-generator-container asyncapi-generator && \
	docker cp asyncapi-generator-container:/async-server mock-server/ ; \
	docker rm asyncapi-generator-container ; \
	docker rmi asyncapi-generator
	rm -rf mock-server/asyncapi.yaml

# async-serverのコンテナを作成し、8080ポートで起動
mock-start:
	# 8080ポートにアクセスすると通信ができる。imageは都度削除される
	docker build -t async-server-image mock-server/async-server
	docker run --rm --name async-server -p 8080:80 async-server-image

PHONY:generate clean mock cert
