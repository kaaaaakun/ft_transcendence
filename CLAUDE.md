# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application for a real-time Pong tournament system (42Tokyo ft_transcendence project). The application features multiplayer Pong games, tournament brackets, user management, and blockchain integration.

## Technology Stack

### Backend (Django API)
- **Django 4.2** with Django REST Framework
- **Django Channels** for WebSocket communication  
- **PostgreSQL** (main database) and **Redis** (cache/channels)
- **Daphne** ASGI server

### Frontend (Vite Static Builder)
- **Vite** build tool with **Vanilla JavaScript**
- **Custom React-like framework** (`teact.js`)
- **Bootstrap 5** with **Sass**
- **Biome** for linting and formatting

### Infrastructure
- **Docker Compose** for containerization
- **Nginx** reverse proxy with SSL
- **ELK Stack** for logging and monitoring
- **Hardhat** for blockchain development

## Common Development Commands

### Main Development Workflow
```bash
# Start development environment
make run                    # Build and start all services
make local                  # Start with local configuration
make re                     # Clean rebuild (down, prune, run)

# Container management
make up                     # Start containers
make down                   # Stop containers  
make fdown                  # Force stop and remove volumes
make ps                     # Show running containers

# Development shortcuts
make build                  # Build all images
make cert                   # Generate SSL certificates
```

### Frontend Development (static-builder)
```bash
# Inside static-builder directory or via Docker
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm lint                   # Run Biome linter
pnpm format                 # Check code formatting
pnpm fix                    # Auto-fix linting and formatting issues

# Via Docker (recommended)
docker compose exec static-builder pnpm dev
docker compose exec static-builder pnpm build
docker compose exec static-builder pnpm lint
```

### Backend Development (Django API)
```bash
# Database and testing
python manage.py test                    # Run all tests
python manage.py test user              # Test specific app
python manage.py test --noinput         # Non-interactive testing
python manage.py makemigrations         # Create migrations
python manage.py migrate                # Apply migrations

# Via Docker (recommended in production)
docker compose exec api python manage.py test
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
```

### Blockchain Development
```bash
# In blockchain directory
npm install                 # Install dependencies
npx hardhat compile         # Compile contracts
npx hardhat test           # Run blockchain tests
npx hardhat deploy         # Deploy contracts
```

## Architecture and Code Organization

### Django Apps Structure
- **`user/`** - Authentication, profiles, user management
- **`match/`** - Game matching logic, real-time game state
- **`tournament/`** - Tournament brackets, tournament flow
- **`room/`** - Room management with Redis integration
- **`friend/`** - Friend system and relationships
- **`utils/`** - Shared utilities and decorators

### Frontend Structure  
- **`src/js/components/`** - Reusable UI components
- **`src/js/pages/`** - Page-level components
- **`src/js/hooks/`** - Custom hooks for state management
- **`src/js/infrastructures/`** - API communication layer
- **`src/js/libs/teact.js`** - Custom React-like framework
- **`src/js/libs/router.js`** - Client-side routing

### Key Configuration Files
- **`config/game-settings.json`** - Shared game configuration (ball speed, paddle size, etc.)
- **`vite.config.js`** - Frontend build configuration with game settings injection
- **`biome.json`** - Code formatting and linting rules
- **`lefthook.yml`** - Git hooks for automated linting/formatting

## Development Guidelines

### Code Style and Linting
- **Frontend**: Uses Biome with strict rules enabled, 2-space indentation, single quotes
- **Backend**: Follow Django conventions and PEP 8
- **Pre-commit hooks**: Automatically run linting and formatting via lefthook

### Testing Strategy
- **Frontend**: Component-level testing (testing strategy TBD)
- **Backend**: Comprehensive Django test suite using `TestCase` and `APITestCase`
- **API Testing**: Tests for authentication, WebSocket connections, game logic

### Environment Management
- **Local development**: Use `make local` for local-only services
- **Full stack**: Use `make run` for complete Docker environment
- **Configuration**: Environment variables managed through `.env.sample` files

### Game Configuration
- Game settings (paddle height, ball radius, score limits) are centralized in `config/game-settings.json`
- These settings are automatically injected into the frontend build via Vite
- Backend reads the same configuration file for consistency

### WebSocket Communication
- Real-time features use Django Channels with Redis backend
- WebSocket consumers handle game state, tournaments, and room management
- Frontend connects via WebSocket for live updates

## Security and Authentication

- **JWT Authentication** via django-rest-framework-simplejwt
- **SSL/TLS** enabled with auto-generated certificates
- **CORS** properly configured for frontend-backend communication
- **Session management** through secure JWT tokens

## Monitoring and Logs

- **ELK Stack** integration for centralized logging
- **Metricbeat** for system metrics collection  
- **Filebeat** for log shipping
- **Kibana** dashboard available for log analysis (when ELK is enabled)

## Blockchain Integration

- **Solidity contracts** in `blockchain/contracts/`
- **Hardhat** for smart contract development and testing
- **Deploy scripts** for contract deployment to various networks