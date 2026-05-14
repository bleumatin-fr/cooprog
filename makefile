install:
	CI=false yarn install
	docker compose run -T --no-deps --rm -w /app server yarn install

FOLDERS_TO_CLEAN := packages/admin/node_modules/* packages/client/node_modules/* packages/core/node_modules/* packages/ops/node_modules/* packages/server/node_modules/* node_modules/* packages/admin/dist packages/client/.next packages/core/dist packages/ops/dist packages/server/dist
FILES_TO_CLEAN := packages/admin/yarn.lock packages/client/yarn.lock packages/server/yarn.lock yarn.lock

clean:
	rm -rf $(FOLDERS_TO_CLEAN)
	rm -f $(FILES_TO_CLEAN)
	docker compose run -T --no-deps -w /app server bash -c "rm -Rf $(FOLDERS_TO_CLEAN)"
	docker compose run -T --no-deps -w /app server bash -c "rm -f $(FILES_TO_CLEAN)"

start:
	docker compose up

stop:
	docker compose down

logs:
	docker compose logs -f

connect-to-server:
	docker compose exec -it server /bin/bash


# Build the project for the given environment
build:
	@echo "Building for environment: $(or $(BUILD_ENV),development)"
	@echo "Using API base URL: $(or $(API_BASE_URL),http://localhost:3000)"
	@if [ -z "$(BUILD_ENV)" ]; then \
		cp -f packages/client/.env packages/client/.env.production; \
	elif [ "$(BUILD_ENV)" != "production" ]; then \
		cp -f packages/client/.env.$(BUILD_ENV) packages/client/.env.production; \
	fi
	docker compose run -T --no-deps --rm -w /app/packages/core core yarn build
	docker compose run -T --no-deps --rm -w /app/packages/server server yarn build
	docker compose run -T --no-deps --rm -e NODE_ENV=production -w /app/packages/client client yarn build
	docker compose run -T --no-deps --rm -e VITE_APP_API_URL=$(or $(API_BASE_URL),http://localhost:3000)/admin/api -e VITE_APP_AUTH_API_URL=$(or $(API_BASE_URL),http://localhost:3000)/api/authentication -w /app/packages/admin admin yarn build
