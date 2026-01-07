***

# Software Engineer Screening Task

## Overview

This is a technical assessment designed to evaluate your skills with modern full‑stack development.  
You will build a simplified project management system that demonstrates proficiency with the core tech stack and architectural patterns used by the team.

***

## Task: Mini Project Management System

Build a **multi‑tenant project management tool** with the following features.

### Backend (Django + GraphQL)

#### 1. Core Data Models

Create Django models for:

- **Organization**
  - `name`
  - `slug`
  - `contact_email`
- **Project** (organization‑dependent)
  - `organization`
  - `name`
  - `status`
  - `description`
  - `due_date`
- **Task** (project‑dependent)
  - `project`
  - `title`
  - `description`
  - `status`
  - `assignee_email`
  - `due_date`
- **TaskComment**
  - `task`
  - `content`
  - `author_email`
  - `timestamp`

#### 2. API Layer (GraphQL)

Expose a GraphQL schema with queries and mutations for:

- Listing projects for an organization  
- Creating and updating projects  
- Creating and updating tasks  
- Adding comments to tasks  
- Basic project statistics:
  - Task counts  
  - Completion rates  

#### 3. Multi‑tenancy

Implement **organization‑based data isolation**:

- Ensure proper data separation between organizations  
- Add organization context to all operations (e.g., via slug, header, or token)

***

### Frontend (React + TypeScript)

#### 1. Project Dashboard

- List view of projects with status indicators  
- Create/edit project form with validation  
- Responsive design using TailwindCSS  

#### 2. Task Management

- Task board or list view  
- Add/edit tasks with status updates  
- Comment system for tasks  

#### 3. GraphQL Integration

- Apollo Client setup with error handling  
- Optimistic updates for mutations where appropriate  
- Proper cache management  

#### 4. UI Components

- Modern, clean component design  
- Proper TypeScript interfaces and types  
- Loading states and error handling  
- Basic animations/transitions (e.g., hover, fade, modal transitions)

***

## Technical Stack

- **Backend**: Django 4.x, Django REST Framework, GraphQL (Graphene), PostgreSQL  
- **Frontend**: React 18+, TypeScript, Apollo Client, TailwindCSS  
- **Database**: PostgreSQL (Docker or local setup)

***

## Deliverables

1. **GitHub Repository** with a clean commit history  
2. **Setup Instructions**:
   - README with installation and run steps for backend and frontend  
3. **API Documentation**:
   - Endpoint list (if any REST)
   - GraphQL schema and main queries/mutations  
4. **Demo**:
   - Screenshots or a brief demo video showing core flows  
5. **Technical Summary**:
   - Key decisions made  
   - Trade‑offs considered  
   - Possible future improvements  

***

## Sample Backend Models (Illustrative)

```python
class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    contact_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)


class Project(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES)
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

***

## Sample Frontend Interfaces (Illustrative)

```ts
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  taskCount: number;
  completedTasks: number;
  dueDate?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeEmail: string;
  dueDate?: string;
}
```

***

## Evaluation Criteria

### Must Have (70%)

- Working Django models with proper relationships  
- Functional GraphQL API with organization isolation  
- React components built with TypeScript  
- Apollo Client integration  
- Clean code structure and organization  

### Should Have (20%)

- Form validation and error handling  
- Basic test coverage  
- Responsive UI design  
- Proper database migrations  
- Mock external integrations (if applicable)  

### Nice to Have (10%)

- Advanced GraphQL features:
  - Subscriptions  
  - Complex filtering  
- Comprehensive testing  
- Docker containerization (backend and/or frontend)  
- Performance optimizations  
- Advanced UI features:
  - Drag‑and‑drop
  - Real‑time updates  

***

## Key Focus Areas

- **Architecture**: Clean separation of concerns, proper abstractions  
- **Data Modeling**: Efficient relationships and constraints  
- **API Design**: GraphQL best practices, clear schema and types  
- **Frontend Patterns**: Component composition, state management, and UX  
- **Documentation**: Clear setup instructions and API documentation  

***

## Bonus Points

- Real‑time features using WebSockets / GraphQL subscriptions  
- Advanced filtering and search capabilities  
- Mobile‑responsive and accessible design  
- Performance monitoring and logging  
- CI/CD setup for automated testing and deployment  

***

## Submission Instructions

Submit within **48 hours**:

1. **GitHub repository** (public or with appropriate access)  
2. **README** file with instructions to set up and start the application locally  

***

## Questions

You may ask clarifications about:

- Specific feature requirements  
- Technical implementation approaches  
- Scope and trade‑offs  
- Setup or tooling questions  

Focus on **quality over quantity**: a well‑executed subset of the features is better than a rushed complete implementation.

**