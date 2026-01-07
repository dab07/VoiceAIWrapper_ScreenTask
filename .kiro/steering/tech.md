# Technology Stack

## Backend
- **Framework**: Django 4.2.7 with Python
- **API**: GraphQL using graphene-django 3.0.0
- **Database**: PostgreSQL with psycopg2-binary
- **Configuration**: python-decouple for environment variables
- **CORS**: django-cors-headers for frontend integration
- **Filtering**: django-filter for query filtering

## Frontend
- **Framework**: React 18.2.0 with Create React App
- **Language**: TypeScript 4.9.5
- **Styling**: TailwindCSS 3.3.6
- **Routing**: react-router-dom 6.18.0
- **GraphQL Client**: Apollo Client 3.8.7
- **State Management**: React Query 3.39.3 for server state
- **Notifications**: react-hot-toast 2.4.1
- **Development Server**: Proxies to backend on localhost:8000

## Development Setup

### Backend Commands
```bash
# Initial setup
cd Backend
chmod +x setup.sh
./setup.sh

# Development
python manage.py runserver          # Start dev server on :8000
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py shell              # Django shell
python manage.py createsuperuser    # Create admin user
```

### Frontend Commands
```bash
# Development
cd Frontend
npm install                         # Install dependencies
npm start                          # Start dev server on :3000
npm run build                      # Production build
npm test                           # Run tests
```

## Architecture Patterns
- **Multi-tenant**: Organization-scoped data using custom middleware
- **GraphQL Schema**: Single endpoint with type-based queries and mutations
- **Component Structure**: Page components with shared components
- **State Management**: Apollo Client cache + React Query for server state
- **Authentication**: Header-based organization context (X-Organization-Slug)
- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Modern UI**: TailwindCSS utility-first styling with responsive design