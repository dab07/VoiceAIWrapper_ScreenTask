#!/bin/bash

echo "Setting up Django + GraphQL Backend..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update database credentials."
fi

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "Would you like to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
fi

# Create demo organization
python manage.py shell << EOF
from core.models import Organization
if not Organization.objects.filter(slug='demo-org').exists():
    org = Organization.objects.create(
        name='Demo Organization',
        contact_email='demo@example.com'
    )
    print(f'Created demo organization: {org.name} (slug: {org.slug})')
else:
    print('Demo organization already exists')
EOF

echo "Setup complete! Run 'python manage.py runserver' to start the development server."