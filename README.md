# Project Management Application

A full-stack project management application built with Django (GraphQL API) and React (TypeScript). This application allows organizations to manage projects and tasks with multi-tenant architecture.

## 🚀 Features

- **Multi-tenant Architecture**: Organization-scoped data isolation
- **Project Management**: Create, update, and track projects with status workflow
- **Task Management**: Manage tasks within projects with comments
- **Dashboard Analytics**: Real-time project statistics and completion rates
- **GraphQL API**: Single endpoint with type-safe queries and mutations
- **Modern UI**: React with TypeScript and TailwindCSS

## 🛠 Technology Stack

### Backend
- Django 4.2.7 with Python
- GraphQL using graphene-django 3.0.0
- PostgreSQL with psycopg2-binary
- Django CORS headers for frontend integration

### Frontend
- React 18.2.0 with TypeScript 4.9.5
- Apollo Client 3.8.7 for GraphQL
- TailwindCSS 3.3.6 for styling
- React Router DOM 6.18.0 for routing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 16+** and npm
- **PostgreSQL 12+**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-management-app
```

### 2. Backend Setup (Django)

```bash
# Navigate to backend directory
cd Backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Create PostgreSQL database
createdb screening_task

# Run database migrations
python3 manage.py makemigrations core
python3 manage.py migrate

# Create superuser (optional)
python3 manage.py createsuperuser

# Start development server
python3 manage.py runserver
```

The backend will be available at `http://localhost:8000`
- GraphQL endpoint: `http://localhost:8000/graphql/`
- Admin interface: `http://localhost:8000/admin/`

### 3. Frontend Setup (React)

Open a new terminal window:

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 Environment Configuration

### Backend (.env)

Create a `.env` file in the `Backend/` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=screening_task
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend

The frontend is configured to proxy API requests to `http://localhost:8000` during development.

## 📊 Usage

### Organization Context

The application uses organization-based multi-tenancy. You can:

1. **Via HTTP Header**: Pass `X-Organization-Slug` header with requests
2. **Via Query Parameter**: Use `?org_slug=your-org-slug` in URLs
3. **Via Frontend**: The React app manages organization context automatically

### Sample Data

To create sample data for testing:

```bash
cd Backend
python manage.py shell
```

```python
from core.models import Organization, Project, Task

# Create organization
org = Organization.objects.create(name="Acme Corp", contact_email="admin@acme.com")

# Create project
project = Project.objects.create(
    name="Website Redesign",
    description="Redesign company website",
    organization=org,
    status="ACTIVE"
)

# Create task
task = Task.objects.create(
    title="Design Homepage",
    description="Create new homepage design",
    project=project,
    status="TODO",
    assignee_email="designer@acme.com"
)
```

## 🧪 Development Commands

### Backend Commands

```bash
cd Backend

# Run development server
python3 manage.py runserver

# Create migrations
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate

# Django shell
python3 manage.py shell

# Run tests
python3 manage.py test

# Create superuser
python3 manage.py createsuperuser
```

### Frontend Commands

```bash
cd Frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new dependency
npm install package-name
```

## 📁 Project Structure

```
├── Backend/                    # Django backend
│   ├── core/                  # Main Django app
│   │   ├── models.py          # Data models
│   │   ├── schema.py          # GraphQL schema
│   │   └── middleware.py      # Organization middleware
│   ├── screening_task/        # Django project settings
│   ├── requirements.txt       # Python dependencies
│   └── manage.py              # Django management script
├── Frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Route components
│   │   ├── graphql/           # GraphQL queries/mutations
│   │   ├── apollo/            # Apollo Client setup
│   │   └── types/             # TypeScript definitions
│   ├── package.json           # Node.js dependencies
│   └── tsconfig.json          # TypeScript config
└── README.md                   # This file
```

## 🔍 API Documentation

### GraphQL Endpoint

Visit `http://localhost:8000/graphql/` for the interactive GraphiQL interface.

### Key Queries

```graphql
# Get all projects for organization
query {
  projects {
    id
    name
    status
    taskCount
    completionRate
  }
}

# Get project statistics
query {
  projectStats {
    totalProjects
    activeProjects
    completedProjects
    overallCompletionRate
  }
}
```

### Key Mutations

```graphql
# Create new project
mutation {
  createProject(name: "New Project", description: "Description") {
    project {
      id
      name
      status
    }
  }
}

# Update task status
mutation {
  updateTask(id: "1", status: IN_PROGRESS) {
    task {
      id
      status
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists: `createdb screening_task`

2. **CORS Issues**
   - Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
   - Check that django-cors-headers is installed

3. **Frontend Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **GraphQL Schema Issues**
   - Run migrations: `python manage.py migrate`
   - Restart Django server after schema changes
