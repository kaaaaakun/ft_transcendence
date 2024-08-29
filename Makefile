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

PHONY: run re build up down fdown image-prune ps generate

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

mock:
	prism mock openapi.yaml

PHONY:generate clean mock
