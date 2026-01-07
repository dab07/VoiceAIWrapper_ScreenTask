import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from django.db.models import Count, Q
from .models import Organization, Project, Task, TaskComment


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'


class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_task_count = graphene.Int()
    completion_rate = graphene.Float()

    class Meta:
        model = Project
        fields = '__all__'

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_task_count(self, info):
        return self.tasks.filter(status='DONE').count()

    def resolve_completion_rate(self, info):
        total = self.tasks.count()
        if total == 0:
            return 0.0
        completed = self.tasks.filter(status='DONE').count()
        return (completed / total) * 100


class TaskType(DjangoObjectType):
    comment_count = graphene.Int()

    class Meta:
        model = Task
        fields = '__all__'

    def resolve_comment_count(self, info):
        return self.comments.count()


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'


class ProjectStatsType(graphene.ObjectType):
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()


class Query(graphene.ObjectType):
    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))

    # Project queries
    projects = graphene.List(ProjectType, organization_slug=graphene.String())
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    # Task queries
    tasks = graphene.List(TaskType, project_id=graphene.ID())
    task = graphene.Field(TaskType, id=graphene.ID(required=True))

    # Comment queries
    task_comments = graphene.List(TaskCommentType, task_id=graphene.ID(required=True))

    # Statistics
    project_stats = graphene.Field(ProjectStatsType, organization_slug=graphene.String())

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

    def resolve_projects(self, info, organization_slug=None):
        queryset = Project.objects.all()
        
        # Use organization from middleware if available
        if hasattr(info.context, 'organization') and info.context.organization:
            queryset = queryset.filter(organization=info.context.organization)
        elif organization_slug:
            queryset = queryset.filter(organization__slug=organization_slug)
        
        return queryset

    def resolve_project(self, info, id):
        try:
            project = Project.objects.get(id=id)
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if project.organization != info.context.organization:
                    return None
            return project
        except Project.DoesNotExist:
            return None

    def resolve_tasks(self, info, project_id=None):
        queryset = Task.objects.all()
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by organization through project relationship
        if hasattr(info.context, 'organization') and info.context.organization:
            queryset = queryset.filter(project__organization=info.context.organization)
        
        return queryset

    def resolve_task(self, info, id):
        try:
            task = Task.objects.get(id=id)
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if task.project.organization != info.context.organization:
                    return None
            return task
        except Task.DoesNotExist:
            return None

    def resolve_task_comments(self, info, task_id):
        queryset = TaskComment.objects.filter(task_id=task_id)
        
        # Check organization access through task->project->organization
        if hasattr(info.context, 'organization') and info.context.organization:
            queryset = queryset.filter(task__project__organization=info.context.organization)
        
        return queryset

    def resolve_project_stats(self, info, organization_slug=None):
        queryset = Project.objects.all()
        
        # Use organization from middleware if available
        if hasattr(info.context, 'organization') and info.context.organization:
            queryset = queryset.filter(organization=info.context.organization)
        elif organization_slug:
            queryset = queryset.filter(organization__slug=organization_slug)
        
        total_projects = queryset.count()
        active_projects = queryset.filter(status='ACTIVE').count()
        completed_projects = queryset.filter(status='COMPLETED').count()
        
        # Task statistics
        total_tasks = Task.objects.filter(project__in=queryset).count()
        completed_tasks = Task.objects.filter(project__in=queryset, status='DONE').count()
        
        overall_completion_rate = 0.0
        if total_tasks > 0:
            overall_completion_rate = (completed_tasks / total_tasks) * 100
        
        return ProjectStatsType(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=overall_completion_rate
        )


# Mutations
class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, contact_email):
        organization = Organization.objects.create(
            name=name,
            contact_email=contact_email
        )
        return CreateOrganization(organization=organization)


class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        due_date = graphene.Date()
        organization_slug = graphene.String()

    project = graphene.Field(ProjectType)

    def mutate(self, info, name, description=None, due_date=None, organization_slug=None):
        # Use organization from middleware if available
        organization = None
        if hasattr(info.context, 'organization') and info.context.organization:
            organization = info.context.organization
        elif organization_slug:
            try:
                organization = Organization.objects.get(slug=organization_slug)
            except Organization.DoesNotExist:
                raise Exception("Organization not found")
        else:
            raise Exception("Organization is required")

        project = Project.objects.create(
            organization=organization,
            name=name,
            description=description or '',
            due_date=due_date
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, id, name=None, description=None, status=None, due_date=None):
        try:
            project = Project.objects.get(id=id)
            
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if project.organization != info.context.organization:
                    raise Exception("Access denied")
            
            if name is not None:
                project.name = name
            if description is not None:
                project.description = description
            if status is not None:
                project.status = status
            if due_date is not None:
                project.due_date = due_date
            
            project.save()
            return UpdateProject(project=project)
        except Project.DoesNotExist:
            raise Exception("Project not found")


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description=None, assignee_email=None):
        try:
            project = Project.objects.get(id=project_id)
            
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if project.organization != info.context.organization:
                    raise Exception("Access denied")
            
            task = Task.objects.create(
                project=project,
                title=title,
                description=description or '',
                assignee_email=assignee_email or ''
            )
            return CreateTask(task=task)
        except Project.DoesNotExist:
            raise Exception("Project not found")


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, title=None, description=None, status=None, assignee_email=None):
        try:
            task = Task.objects.get(id=id)
            
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if task.project.organization != info.context.organization:
                    raise Exception("Access denied")
            
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if status is not None:
                task.status = status
            if assignee_email is not None:
                task.assignee_email = assignee_email
            
            task.save()
            return UpdateTask(task=task)
        except Task.DoesNotExist:
            raise Exception("Task not found")


class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, content, author_email):
        try:
            task = Task.objects.get(id=task_id)
            
            # Check organization access
            if hasattr(info.context, 'organization') and info.context.organization:
                if task.project.organization != info.context.organization:
                    raise Exception("Access denied")
            
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )
            return AddTaskComment(comment=comment)
        except Task.DoesNotExist:
            raise Exception("Task not found")


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    add_task_comment = AddTaskComment.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)