# AGENT.md - QuickCart Development Guide

## Commands
- Build: `cd client && npm run build`
- Lint: `cd client && npm run lint` (ESLint for frontend)
- Test: `cd server && python -m pytest` (backend) or `cd client && npm test` (frontend)
- Single test: `cd server && python -m pytest tests/test_auth_api.py::TestAuthAPI::test_login_success`
- Start dev: `cd server && python run.py` (backend) and `cd client && npm run dev` (frontend)
- Coverage: `cd server && python -m pytest --cov`
- Install deps: `cd server && pip install -r requirements.txt` and `cd client && npm install`
- Deploy check: `python scripts/deploy-check.py` (verify production deployment)
- Seed production: `python scripts/seed-production.py` (populate production database)

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS (client/)
- **Backend**: Flask + SQLAlchemy + SQLite + JWT auth (server/)
- **API**: REST endpoints at `/api/*` with CORS, JWT auth for protected routes
- **Database**: SQLite with models: Product, User, Order, OrderItem
- **Authentication**: JWT tokens, password hashing, protected routes
- **Tests**: Vitest (frontend), Pytest (backend) with coverage

## Code Style
- **Python**: Snake_case, type hints preferred, Flask patterns, JWT decorators
- **JavaScript**: CamelCase, ES6+ modules, React hooks patterns
- **Imports**: Relative imports within components, absolute for services
- **Error handling**: Try/catch for API calls, Flask error handlers, auth errors
- **Database**: SQLAlchemy ORM with to_dict() methods for serialization
- **API responses**: JSON with consistent error format {error: "message"}
- **Frontend state**: React Context for global state (auth, cart), local state for components
- **Authentication**: Token stored in localStorage, automatic refresh on 401
