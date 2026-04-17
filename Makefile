export COMPOSE_BAKE=true

GREEN = \033[0;32m
RESET = \033[0m

COMPOSE = docker compose -f srcs/docker-compose.yml

all: build list

up:
	@echo "Sistemin IP adresi taranıyor..."
	@IP=$$(hostname -I | awk '{print $$1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo 127.0.0.1); \
	if [ -z "$$IP" ]; then IP="127.0.0.1"; fi; \
	echo "Bulunan IP: $$IP"; \
	sed -i "s/^DOMAIN_NAME=.*/DOMAIN_NAME=$$IP/" srcs/.env; \
	sed -i "s|^FT_REDIRECT_URI=.*|FT_REDIRECT_URI=https://$$IP:8443/api/user/auth/callback/|" srcs/.env; \
	echo "srcs/.env dosyası dinamik olarak güncellendi!"
	@$(COMPOSE) up -d --build

down:
	@echo "$(GREEN)Stopping services...$(RESET)"
	@$(COMPOSE) down

# Clean Project, network and volumes(database)
clean:
	@echo "$(GREEN)Force removing containers and VOLUMES...$(RESET)"
	@$(COMPOSE) down -v --remove-orphans

# Including old installations cleans everything
fclean: clean
	@echo "$(GREEN)Deep cleaning the system...$(RESET)"
	@docker system prune -af
	@docker volume prune -f

re: clean all

# Rebuild and start containers
build:
	@echo "$(GREEN)Building and starting containers...$(RESET)"
	@$(COMPOSE) up -d --build

build-%:
	@echo "$(GREEN)Building and starting containers...$(RESET)"
	@$(COMPOSE) up -d --build $*

list:
	@sleep 1
	@echo "$(GREEN)Listing running containers...$(RESET)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

migrate:
	@echo "$(GREEN)Running migrations...$(RESET)"
	@$(COMPOSE) exec user_service python manage.py makemigrations
	@$(COMPOSE) exec user_service python manage.py migrate

seed:
	@$(COMPOSE) exec user_service python seed_db.py

logs-%:
	@$(COMPOSE) logs $* --tail 10

# Eg. make restart-combat_service
restart-%:
	@echo "$(GREEN)Restarting service: $*...$(RESET)"
	@$(COMPOSE) restart $*

.PHONY: all clean fclean re build list down migrate logs up seed
