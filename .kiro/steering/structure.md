# Project Structure

## Root Directory
```
├── Backend/                    # Django backend application
├── Frontend/                   # React frontend application
└── Software Engineer Screening Task.docx
```

## Backend Structure (`Backend/`)
```
├── core/                       # Main Django app
│   ├── migrations/            # Database migrations
│   ├── models.py              # Data models (Organization, Project, Task, TaskComment)
│   ├── schema.py              # GraphQL schema definitions
│   ├── admin.py               # Django admin configuration
│   ├── middleware.py          # Organization middleware for multi-tenancy
│   └── apps.py                # App configuration
├── screening_task/            # Django project settings
│   ├── settings.py            # Main settings file
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI configuration
│   └── asgi.py                # ASGI configuration
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
├── setup.sh                   # Setup script
└── .env.example               # Environment variables template
```

## Frontend Structure (`Frontend/`)
```
├── public/
│   └── index.html             # HTML template
├── src/
│   ├── components/            # Reusable UI components
│   │   └── Header.tsx         # Navigation header (TypeScript)
│   ├── pages/                 # Route-based page components
│   │   ├── Dashboard.tsx      # Main dashboard with stats (TypeScript)
│   │   ├── Projects.tsx       # Projects listing (TypeScript)
│   │   ├── ProjectDetail.tsx  # Individual project view (TypeScript)
│   │   └── TaskDetail.tsx     # Individual task view (TypeScript)
│   ├── graphql/               # GraphQL operations
│   │   ├── queries.ts         # GraphQL queries (TypeScript)
│   │   └── mutations.ts       # GraphQL mutations (TypeScript)
│   ├── apollo/                # Apollo Client configuration
│   │   └── client.ts          # Apollo client setup with auth (TypeScript)
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Interface definitions for all data types
│   ├── App.tsx                # Main app component with routing (TypeScript)
│   ├── index.tsx              # React entry point (TypeScript)
│   └── index.css              # Global styles with TailwindCSS
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # TailwindCSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Node.js dependencies and scripts
```

## Key Conventions
- **Models**: Follow Django naming conventions with related_name attributes
- **GraphQL**: Types mirror Django models, mutations follow Create/Update pattern
- **Components**: Functional components with hooks, organized by purpose
- **Routing**: RESTful URL patterns (`/projects/:id`, `/tasks/:id`)
- **Organization Context**: Passed via middleware and HTTP headers
- **File Naming**: PascalCase for React components, snake_case for Python files
- **TypeScript**: Strict typing with proper interfaces for all data structures
- **Status Values**: Use uppercase constants (ACTIVE, COMPLETED, ON_HOLD for projects; TODO, IN_PROGRESS, DONE for tasks)
- **Styling**: TailwindCSS utility classes with custom component styles