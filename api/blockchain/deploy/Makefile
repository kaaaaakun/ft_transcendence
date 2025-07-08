deploy:
	@if [ -d "./artifacts" ]; then \
		echo "❌ artifactsディレクトリが存在します。先に 'rm -rf ./artifacts' を実行してください。"; \
		exit 1; \
	fi
	docker-compose --env-file .env up --build --remove-orphans
	docker-compose --env-file .env down --remove-orphans

test:
	npm install
	node sign-tx.js

.PHONY: deploy
