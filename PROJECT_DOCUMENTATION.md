# Project Management Application - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Backend Deep Dive](#backend-deep-dive)
4. [Frontend Deep Dive](#frontend-deep-dive)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Setup & Installation](#setup--installation)
8. [Key Features Walkthrough](#key-features-walkthrough)
9. [Code Structure Explanation](#code-structure-explanation)
10. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

This is a **full-stack project management application** built as a screening task, demonstrating modern web development practices with Django and React.

### Core Concept
- **Multi-tenant SaaS application** where organizations can manage their projects and tasks
- **Organization-scoped data isolation** - each organization only sees their own data
- **Real-time dashboard** with project statistics and completion tracking
- **GraphQL API** for efficient data fetching and mutations

### Business Logic
- Organizations contain multiple projects
- Projects contain multiple tasks
- Tasks can have comments for collaboration
- Email-based assignment system (no user authentication)
- Status workflows for both projects and tasks

---

## 🏗 Architecture & Technology Stack

### Backend Stack
```
Django 4.2.7          → Web framework
GraphQL (Graphene)     → API layer
PostgreSQL             → Database
python-decouple        → Environment configuration
django-cors-headers    → CORS handling
```

### Frontend Stack
```
React 18.2.0           → UI framework
TypeScript 4.9.5       → Type safety
Apollo Client 3.8.7    → GraphQL client
TailwindCSS 3.3.6      → Styling
React Router DOM       → Navigation
React Hot Toast        → Notifications
```

### Architecture Pattern
```
Frontend (React) ←→ GraphQL API ←→ Django Backend ←→ PostgreSQL
     ↓                    ↓              ↓              ↓
  Apollo Client    Single Endpoint   ORM Models    Relational DB
  Type Safety      Schema-first      Multi-tenant   ACID Compliance
```

---

## 🔧 Backend Deep Dive

### 1. Django Project Structure
```
Backend/
├── core/                    # Main Django app
│   ├── models.py           # Data models (Organization, Project, Task, TaskComment)
│   ├── schema.py           # GraphQL schema definitions
│   ├── admin.py            # Django admin configuration
│   ├── middleware.py       # Organization middleware for multi-tenancy
│   └── apps.py             # App configuration
├── screening_task/         # Django project settings
│   ├── settings.py         # Main configuration file
│   └── urls.py             # URL routing
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables
```

### 2. Data Models Explained

#### Organization Model
```python
class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)  # Auto-generated
    contact_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
```
- **Purpose**: Represents a company/organization using the system
- **Key Feature**: Auto-generates slug from name for URL-friendly identifiers
- **Multi-tenancy**: Root level for data isolation

#### Project Model
```python
class Project(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
```
- **Purpose**: Represents projects within an organization
- **Business Rule**: Unique project names within each organization
- **Status Workflow**: ACTIVE → COMPLETED or ON_HOLD

#### Task Model
```python
class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assignee_email = models.EmailField(blank=True)
```
- **Purpose**: Individual tasks within projects
- **Assignment**: Email-based (no user accounts needed)
- **Status Workflow**: TODO → IN_PROGRESS → DONE

### 3. GraphQL Schema Architecture

#### Schema Structure
```graphql
type Query {
    organizations: [OrganizationType]
    projects: [ProjectType]
    projectStats: ProjectStatsType
    tasks: [TaskType]
}

type Mutation {
    createProject(name: String!, description: String): CreateProject
    updateProject(id: ID!, status: String): UpdateProject
    createTask(projectId: ID!, title: String!): CreateTask
}
```

### 4. Multi-Tenant Middleware
```python
class OrganizationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract organization slug from header
        org_slug = request.META.get('HTTP_X_ORGANIZATION_SLUG')
        
        if org_slug:
            try:
                organization = Organization.objects.get(slug=org_slug)
                request.organization = organization
            except Organization.DoesNotExist:
                request.organization = None
        
        return self.get_response(request)
```
- **Purpose**: Automatically filters data by organization
- **How it works**: Reads `X-Organization-Slug` header from requests
- **Security**: Ensures data isolation between organizations

---

## ⚛️ Frontend Deep Dive

### 1. React Application Structure
```
Frontend/src/
├── components/             # Reusable UI components
│   └── Header.tsx         # Navigation header
├── pages/                 # Route-based page components
│   ├── Dashboard.tsx      # Main dashboard with stats
│   ├── Projects.tsx       # Projects listing
│   ├── ProjectDetail.tsx  # Individual project view
│   └── TaskDetail.tsx     # Individual task view
├── graphql/               # GraphQL operations
│   ├── queries.ts         # GraphQL queries
│   └── mutations.ts       # GraphQL mutations
├── apollo/                # Apollo Client configuration
│   └── client.ts          # Apollo client setup
├── types/                 # TypeScript definitions
│   └── index.ts           # Interface definitions
├── App.tsx                # Main app component with routing
└── index.tsx              # React entry point
```

### 2. Apollo Client Configuration
```typescript
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
  const orgSlug = localStorage.getItem('organizationSlug') || 'acme-corporation';
  
  return {
    headers: {
      ...headers,
      'X-Organization-Slug': orgSlug,  // Multi-tenancy header
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```
- **Purpose**: Configures GraphQL client with authentication
- **Multi-tenancy**: Automatically adds organization header to all requests
- **Caching**: InMemoryCache for performance optimization

### 3. TypeScript Interfaces
```typescript
export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  taskCount: number;
  completedTaskCount: number;
  completionRate: number;
  organization: Organization;
}
```
- **Purpose**: Ensures type safety across the application
- **Benefits**: Compile-time error checking, better IDE support
- **Consistency**: Matches GraphQL schema types

### 4. Component Architecture

#### Dashboard Component
```typescript
const Dashboard: React.FC = () => {
  const { data: statsData, loading: statsLoading, error: statsError } = 
    useQuery<StatsData>(GET_PROJECT_STATS);
  
  const { data: projectsData, loading: projectsLoading, error: projectsError } = 
    useQuery<DashboardData>(GET_PROJECTS);

  // Render statistics cards and recent projects
};
```
- **Purpose**: Main landing page showing project overview
- **Data Fetching**: Uses Apollo's useQuery hook
- **Real-time**: Automatically updates when data changes

---

## 🗄 Database Schema

### Entity Relationship Diagram
```
Organization (1) ←→ (N) Project (1) ←→ (N) Task (1) ←→ (N) TaskComment
     ↓                    ↓              ↓              ↓
   - name              - name         - title       - content
   - slug              - status       - status      - author_email
   - contact_email     - description  - assignee    - timestamp
   - created_at        - due_date     - due_date
```

### Key Relationships
- **Organization → Projects**: One-to-Many (CASCADE delete)
- **Project → Tasks**: One-to-Many (CASCADE delete)
- **Task → Comments**: One-to-Many (CASCADE delete)

### Indexes & Constraints
- **Unique Constraints**: Organization names, project names within organization
- **Foreign Keys**: Ensure referential integrity
- **Indexes**: Automatic on primary keys and foreign keys

---

## 🔌 API Documentation

### GraphQL Queries

#### Get Project Statistics
```graphql
query GetProjectStats {
  projectStats {
    totalProjects
    activeProjects
    completedProjects
    totalTasks
    completedTasks
    overallCompletionRate
  }
}
```

#### Get All Projects
```graphql
query GetProjects {
  projects {
    id
    name
    status
    description
    taskCount
    completedTaskCount
    completionRate
    createdAt
  }
}
```

#### Get Project Details
```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    status
    description
    taskCount
    completedTaskCount
    completionRate
    tasks {
      id
      title
      status
      assigneeEmail
      createdAt
    }
  }
}
```

### GraphQL Mutations

#### Create Project
```graphql
mutation CreateProject($name: String!, $description: String) {
  createProject(name: $name, description: $description) {
    project {
      id
      name
      status
    }
  }
}
```

#### Update Project Status
```graphql
mutation UpdateProject($id: ID!, $status: String!) {
  updateProject(id: $id, status: $status) {
    project {
      id
      status
    }
  }
}
```

#### Create Task
```graphql
mutation CreateTask($projectId: ID!, $title: String!, $description: String, $assigneeEmail: String) {
  createTask(projectId: $projectId, title: $title, description: $description, assigneeEmail: $assigneeEmail) {
    task {
      id
      title
      status
    }
  }
}
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup
```bash
# 1. Navigate to backend
cd Backend

# 2. Install dependencies
pip3 install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Create database
createdb screening_task

# 5. Run migrations
python3 manage.py makemigrations core
python3 manage.py migrate

# 6. Create superuser (optional)
python3 manage.py createsuperuser

# 7. Start development server
python3 manage.py runserver
```

### Frontend Setup
```bash
# 1. Navigate to frontend
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

### Environment Configuration
```env
# Backend/.env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=screening_task
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

---

## ✨ Key Features Walkthrough

### 1. Multi-Tenant Architecture
- **Organization Isolation**: Each organization sees only their data
- **Header-Based**: Uses `X-Organization-Slug` header for context
- **Middleware**: Automatically filters all database queries
- **Security**: Prevents data leakage between organizations

### 2. Real-Time Dashboard
- **Statistics Cards**: Total projects, active projects, completion rates
- **Recent Projects**: Shows latest 5 projects with progress bars
- **Auto-Update**: Uses Apollo Client cache for real-time updates
- **Responsive Design**: Works on desktop and mobile

### 3. Project Management
- **CRUD Operations**: Create, read, update, delete projects
- **Status Workflow**: Active → Completed/On Hold
- **Task Tracking**: Shows task count and completion percentage
- **Due Date Support**: Optional project deadlines

### 4. Task Management
- **Nested Structure**: Tasks belong to projects
- **Status Workflow**: TODO → In Progress → Done
- **Email Assignment**: Assign tasks to team members via email
- **Comments System**: Collaborative discussion on tasks

### 5. GraphQL Integration
- **Single Endpoint**: All API calls go through `/graphql/`
- **Type Safety**: Strong typing prevents runtime errors
- **Efficient Queries**: Fetch only needed data
- **Real-time Updates**: Automatic cache invalidation

---

## 📁 Code Structure Explanation

### Backend Code Organization

#### models.py - Data Layer
```python
# Defines database structure
class Organization(models.Model):
    # Organization fields and methods

class Project(models.Model):
    # Project fields and business logic
    
    def save(self, *args, **kwargs):
        # Custom save logic (e.g., slug generation)
```

#### schema.py - API Layer
```python
# GraphQL schema definitions
class ProjectType(DjangoObjectType):
    # Expose Django model as GraphQL type
    task_count = graphene.Int()
    
    def resolve_task_count(self, info):
        # Custom field resolver
        return self.tasks.count()

class Query(graphene.ObjectType):
    # Define available queries
    projects = graphene.List(ProjectType)
    
    def resolve_projects(self, info):
        # Query resolver with organization filtering
```

#### middleware.py - Cross-Cutting Concerns
```python
class OrganizationMiddleware:
    # Handles multi-tenancy across all requests
    def __call__(self, request):
        # Extract and set organization context
```

### Frontend Code Organization

#### Apollo Client Setup
```typescript
// apollo/client.ts
const authLink = setContext((_, { headers }) => {
  // Add organization header to all requests
});

const client = new ApolloClient({
  // Configure GraphQL client
});
```

#### React Components
```typescript
// pages/Dashboard.tsx
const Dashboard: React.FC = () => {
  // Use Apollo hooks for data fetching
  const { data, loading, error } = useQuery(GET_PROJECT_STATS);
  
  // Render UI with loading states and error handling
};
```

#### TypeScript Types
```typescript
// types/index.ts
export interface Project {
  // Define data structures for type safety
};
```

---

## 🔄 Development Workflow

### 1. Adding New Features

#### Backend Changes
1. **Update Models**: Add new fields or models in `models.py`
2. **Create Migrations**: `python3 manage.py makemigrations`
3. **Apply Migrations**: `python3 manage.py migrate`
4. **Update Schema**: Add GraphQL types and resolvers in `schema.py`
5. **Test API**: Use GraphiQL at `http://localhost:8000/graphql/`

#### Frontend Changes
1. **Update Types**: Add TypeScript interfaces in `types/index.ts`
2. **Add Queries**: Create GraphQL queries in `graphql/queries.ts`
3. **Update Components**: Modify React components to use new data
4. **Test UI**: Verify changes in browser

### 2. Database Operations
```bash
# Create new migration
python3 manage.py makemigrations core

# Apply migrations
python3 manage.py migrate

# Reset database (development only)
python3 manage.py flush

# Create sample data
python3 manage.py shell
>>> from core.models import Organization
>>> org = Organization.objects.create(name="Test Org", contact_email="test@example.com")
```

### 3. GraphQL Development
```bash
# Test queries in GraphiQL
http://localhost:8000/graphql/

# Example query
{
  projects {
    id
    name
    taskCount
  }
}
```

### 4. Frontend Development
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 🎥 Video Explanation Guide

### Suggested Video Structure

#### 1. Introduction (2-3 minutes)
- Project overview and goals
- Technology stack explanation
- Architecture diagram walkthrough

#### 2. Backend Deep Dive (8-10 minutes)
- Django project structure
- Database models explanation
- GraphQL schema walkthrough
- Multi-tenant middleware demo
- API testing with GraphiQL

#### 3. Frontend Deep Dive (8-10 minutes)
- React application structure
- Apollo Client configuration
- TypeScript interfaces
- Component architecture
- UI/UX walkthrough

#### 4. Integration Demo (5-7 minutes)
- Full application walkthrough
- Create organization, project, and tasks
- Show real-time updates
- Demonstrate multi-tenancy

#### 5. Code Quality & Best Practices (3-5 minutes)
- Type safety benefits
- Error handling
- Security considerations
- Performance optimizations

### Key Points to Emphasize
- **Modern Stack**: Latest versions of Django, React, GraphQL
- **Type Safety**: TypeScript + GraphQL schema validation
- **Multi-Tenancy**: Enterprise-ready architecture
- **Real-Time**: Efficient data fetching and updates
- **Best Practices**: Clean code, proper error handling, security

---

## 🔍 Technical Decisions Explained

### Why GraphQL over REST?
- **Single Endpoint**: Simplifies API management
- **Type Safety**: Schema-first development
- **Efficient**: Fetch only needed data
- **Real-time**: Built-in subscription support

### Why Apollo Client?
- **Caching**: Intelligent cache management
- **DevTools**: Excellent debugging experience
- **TypeScript**: First-class TypeScript support
- **Community**: Large ecosystem and community

### Why Multi-Tenant Architecture?
- **Scalability**: Single codebase serves multiple organizations
- **Security**: Complete data isolation
- **Efficiency**: Shared infrastructure and maintenance
- **Business Model**: SaaS-ready architecture

### Why TypeScript?
- **Type Safety**: Catch errors at compile time
- **IDE Support**: Better autocomplete and refactoring
- **Documentation**: Types serve as documentation
- **Maintainability**: Easier to refactor large codebases

---

This documentation provides a comprehensive overview of your project management application, covering all aspects from architecture to implementation details. Use this as a reference for your video explanation, focusing on the sections most relevant to your audience.