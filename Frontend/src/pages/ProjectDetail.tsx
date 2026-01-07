import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { GET_PROJECT } from '../graphql/queries';
import { UPDATE_PROJECT, CREATE_TASK } from '../graphql/mutations';
import { Project, Task, CreateTaskInput, UpdateProjectInput } from '../types';

interface ProjectDetailData {
  project: Project & {
    tasks: Task[];
  };
}

interface UpdateProjectData {
  updateProject: {
    project: Project;
  };
}

interface CreateTaskData {
  createTask: {
    task: Task;
  };
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskFormData, setTaskFormData] = useState<CreateTaskInput>({
    projectId: id || '',
    title: '',
    description: '',
    assigneeEmail: ''
  });

  const { data, loading, error, refetch } = useQuery<ProjectDetailData>(GET_PROJECT, {
    variables: { id },
    skip: !id
  });

  const [updateProject] = useMutation<UpdateProjectData>(UPDATE_PROJECT, {
    onCompleted: () => {
      toast.success('Project updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const [createTask, { loading: creatingTask }] = useMutation<CreateTaskData>(CREATE_TASK, {
    onCompleted: () => {
      toast.success('Task created successfully!');
      setShowTaskForm(false);
      setTaskFormData({ projectId: id || '', title: '', description: '', assigneeEmail: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleStatusChange = (newStatus: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD') => {
    if (!id) return;
    updateProject({
      variables: {
        id,
        status: newStatus
      }
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    createTask({
      variables: {
        projectId: id,
        title: taskFormData.title,
        description: taskFormData.description || null,
        assigneeEmail: taskFormData.assigneeEmail || null
      }
    });
  };

  const handleTaskInputChange = (field: keyof CreateTaskInput, value: string) => {
    setTaskFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'ON_HOLD':
        return 'status-on-hold';
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'DONE':
        return 'status-done';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading project</h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Project not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              The project you're looking for doesn't exist or you don't have access to it.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const project = data.project;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link 
          to="/projects" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </div>

      {/* Project Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 mb-4">
              {project.description || 'No description provided'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
              
              {project.dueDate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium mr-2">Due:</span>
                  {new Date(project.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 lg:ml-6">
            <label className="form-label">Update Status</label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'COMPLETED' | 'ON_HOLD')}
              className="form-select"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{project.taskCount}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{project.completedTaskCount}</div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{project.completionRate?.toFixed(1) || 0}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{project.completionRate?.toFixed(0) || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${project.completionRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Create Task Form */}
          {showTaskForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskFormData.title}
                    onChange={(e) => handleTaskInputChange('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={taskFormData.description}
                    onChange={(e) => handleTaskInputChange('description', e.target.value)}
                    placeholder="Enter task description (optional)"
                  />
                </div>
                
                <div>
                  <label className="form-label">Assignee Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={taskFormData.assigneeEmail}
                    onChange={(e) => handleTaskInputChange('assigneeEmail', e.target.value)}
                    placeholder="Enter assignee email (optional)"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={creatingTask}
                  >
                    {creatingTask ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowTaskForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tasks List */}
          {!project.tasks || project.tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
              <div className="mt-6">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTaskForm(true)}
                >
                  Create Task
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900 flex-1 mr-2">
                      <Link 
                        to={`/tasks/${task.id}`} 
                        className="hover:text-indigo-600 transition-colors duration-200"
                      >
                        {task.title}
                      </Link>
                    </h4>
                    <span className={`status-badge ${getStatusBadgeClass(task.status)} flex-shrink-0`}>
                      {formatStatus(task.status)}
                    </span>
                  </div>
                  
                  {task.assigneeEmail && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {task.assigneeEmail}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <Link 
                      to={`/tasks/${task.id}`} 
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;