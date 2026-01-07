# Product Overview

This is a project management application built as a screening task. The system allows organizations to manage projects and tasks with the following core features:

## Core Functionality
- **Multi-tenant architecture**: Organizations can manage their own projects and tasks
- **Project management**: Create, update, and track projects with status tracking (planning, active, on_hold, completed, cancelled)
- **Task management**: Create and manage tasks within projects with status workflow (todo, in_progress, review, done)
- **Task comments**: Add comments to tasks for collaboration
- **Dashboard analytics**: View project statistics and completion rates

## Key Business Rules
- All data is scoped to organizations using middleware-based tenant isolation
- Projects must belong to an organization and have unique names within that organization
- Tasks belong to projects and follow a defined status workflow
- Email-based assignment system for tasks (no user authentication system)
- Automatic slug generation for organizations based on name

## User Experience
- Single-page React application with routing
- GraphQL API for all data operations
- Real-time statistics and completion tracking
- Organization context maintained via localStorage and HTTP headers