// TypeScript interfaces as specified in the assessment

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
  dueDate?: string;
  createdAt: string;
  organization: Organization;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeEmail: string;
  dueDate?: string;
  createdAt: string;
  project: Project;
  commentCount?: number;
}

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  timestamp: string;
  task: Task;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
}

// Form interfaces
export interface CreateProjectInput {
  name: string;
  description?: string;
  dueDate?: string;
  organizationSlug?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  dueDate?: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeEmail?: string;
  dueDate?: string;
}

export interface AddTaskCommentInput {
  taskId: string;
  content: string;
  authorEmail: string;
}