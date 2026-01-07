# Django + GraphQL Backend

This is the backend for the Software Engineer Screening Task, built with Django and GraphQL.

## Features

- **Django Models**: Organization, Project, Task, TaskComment
- **GraphQL API**: Complete schema with queries and mutations
- **Multi-tenancy**: Organization-based data isolation
- **PostgreSQL**: Database backend
- **Admin Interface**: Django admin for data management

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Database Setup**
   - Create a PostgreSQL database named `screening_task`
   - Copy `.env.example` to `.env` and update database credentials

3. **Run Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Development Server**
   ```bash
   python manage.py runserver
   ```

## GraphQL Endpoint

- **URL**: `http://localhost:8000/graphql/`
- **GraphiQL Interface**: Available for testing queries and mutations

## Multi-tenancy

The application implements organization-based multi-tenancy:

- Pass organization slug via `X-Organization-Slug` header
- Or use `org_slug` query parameter
- All data is automatically filtered by organization context

## Example Queries

### List Projects for Organization
```graphql
query {
  projects {
    id
    name
    status
    taskCount
    completionRate
  }
}
```

### Create Project
```graphql
mutation {
  createProject(name: "New Project", description: "Project description") {
    project {
      id
      name
      status
    }
  }
}
```

### Get Project Statistics
```graphql
query {
  projectStats {
    totalProjects
    activeProjects
    completedProjects
    overallCompletionRate
  }
}
```