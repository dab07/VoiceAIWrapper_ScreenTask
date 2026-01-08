import { gql } from '@apollo/client';

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $contactEmail: String!) {
    createOrganization(name: $name, contactEmail: $contactEmail) {
      organization {
        id
        name
        slug
        contactEmail
        createdAt
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String, $dueDate: Date, $organizationSlug: String) {
    createProject(name: $name, description: $description, dueDate: $dueDate, organizationSlug: $organizationSlug) {
      project {
        id
        name
        status
        description
        dueDate
        taskCount
        completedTaskCount
        completionRate
        createdAt
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $name: String, $description: String, $status: String, $dueDate: Date) {
    updateProject(id: $id, name: $name, description: $description, status: $status, dueDate: $dueDate) {
      project {
        id
        name
        status
        description
        dueDate
        taskCount
        completedTaskCount
        completionRate
        createdAt
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!, $description: String, $assigneeEmail: String) {
    createTask(projectId: $projectId, title: $title, description: $description, assigneeEmail: $assigneeEmail) {
      task {
        id
        title
        status
        description
        assigneeEmail
        createdAt
        project {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: String, $assigneeEmail: String) {
    updateTask(id: $id, title: $title, description: $description, status: $status, assigneeEmail: $assigneeEmail) {
      task {
        id
        title
        status
        description
        assigneeEmail
        createdAt
        project {
          id
          name
        }
      }
    }
  }
`;

export const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment {
        id
        content
        authorEmail
        timestamp
        task {
          id
          title
        }
      }
    }
  }
`;