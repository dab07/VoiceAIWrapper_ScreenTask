#!/usr/bin/env python3
"""
Script to create sample data for the project management application
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screening_task.settings')
django.setup()

from core.models import Organization, Project, Task, TaskComment

def create_sample_data():
    print("Creating sample data...")
    
    # Create organization
    org, created = Organization.objects.get_or_create(
        name="Acme Corporation",
        defaults={
            'contact_email': 'admin@acme.com'
        }
    )
    if created:
        print(f"✓ Created organization: {org.name}")
    else:
        print(f"✓ Organization already exists: {org.name}")
    
    # Create projects
    projects_data = [
        {
            'name': 'Website Redesign',
            'description': 'Complete redesign of the company website with modern UI/UX',
            'status': 'ACTIVE'
        },
        {
            'name': 'Mobile App Development',
            'description': 'Develop a mobile app for iOS and Android platforms',
            'status': 'ACTIVE'
        },
        {
            'name': 'Database Migration',
            'description': 'Migrate legacy database to PostgreSQL',
            'status': 'COMPLETED'
        }
    ]
    
    for project_data in projects_data:
        project, created = Project.objects.get_or_create(
            organization=org,
            name=project_data['name'],
            defaults={
                'description': project_data['description'],
                'status': project_data['status']
            }
        )
        if created:
            print(f"✓ Created project: {project.name}")
        else:
            print(f"✓ Project already exists: {project.name}")
    
    # Create tasks for the first project
    website_project = Project.objects.get(name='Website Redesign', organization=org)
    
    tasks_data = [
        {
            'title': 'Design Homepage Mockup',
            'description': 'Create wireframes and mockups for the new homepage',
            'status': 'DONE',
            'assignee_email': 'designer@acme.com'
        },
        {
            'title': 'Implement Responsive Navigation',
            'description': 'Code the responsive navigation menu',
            'status': 'IN_PROGRESS',
            'assignee_email': 'developer@acme.com'
        },
        {
            'title': 'Set up Contact Form',
            'description': 'Create and integrate contact form with backend',
            'status': 'TODO',
            'assignee_email': 'developer@acme.com'
        },
        {
            'title': 'Optimize Images',
            'description': 'Compress and optimize all website images',
            'status': 'TODO',
            'assignee_email': 'designer@acme.com'
        }
    ]
    
    for task_data in tasks_data:
        task, created = Task.objects.get_or_create(
            project=website_project,
            title=task_data['title'],
            defaults={
                'description': task_data['description'],
                'status': task_data['status'],
                'assignee_email': task_data['assignee_email']
            }
        )
        if created:
            print(f"✓ Created task: {task.title}")
        else:
            print(f"✓ Task already exists: {task.title}")
    
    # Create some task comments
    homepage_task = Task.objects.get(title='Design Homepage Mockup', project=website_project)
    
    comments_data = [
        {
            'content': 'Initial mockup looks great! Love the color scheme.',
            'author_email': 'manager@acme.com'
        },
        {
            'content': 'Thanks! I\'ll make some adjustments to the layout based on our discussion.',
            'author_email': 'designer@acme.com'
        }
    ]
    
    for comment_data in comments_data:
        comment, created = TaskComment.objects.get_or_create(
            task=homepage_task,
            content=comment_data['content'],
            defaults={
                'author_email': comment_data['author_email']
            }
        )
        if created:
            print(f"✓ Created comment on task: {homepage_task.title}")
        else:
            print(f"✓ Comment already exists")
    
    print("\n🎉 Sample data creation completed!")
    print(f"📊 Summary:")
    print(f"   - Organizations: {Organization.objects.count()}")
    print(f"   - Projects: {Project.objects.count()}")
    print(f"   - Tasks: {Task.objects.count()}")
    print(f"   - Comments: {TaskComment.objects.count()}")
    print(f"\n🌐 Visit http://localhost:8000/graphql/ to test the GraphQL API")
    print(f"🚀 Start the React frontend with: cd Frontend && npm start")

if __name__ == '__main__':
    create_sample_data()