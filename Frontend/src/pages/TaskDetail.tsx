import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { GET_TASK } from '../graphql/queries';
import { UPDATE_TASK, ADD_TASK_COMMENT } from '../graphql/mutations';
import { Task, TaskComment, UpdateTaskInput, AddTaskCommentInput } from '../types';

interface TaskDetailData {
  task: Task & {
    project: {
      id: string;
      name: string;
    };
    comments: TaskComment[];
  };
}

interface UpdateTaskData {
  updateTask: {
    task: Task;
  };
}

interface AddCommentData {
  addTaskComment: {
    comment: TaskComment;
  };
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commentContent, setCommentContent] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');

  const { data, loading, error, refetch } = useQuery<TaskDetailData>(GET_TASK, {
    variables: { id },
    skip: !id
  });

  const [updateTask] = useMutation<UpdateTaskData>(UPDATE_TASK, {
    onCompleted: () => {
      toast.success('Task updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const [addComment, { loading: addingComment }] = useMutation<AddCommentData>(ADD_TASK_COMMENT, {
    onCompleted: () => {
      toast.success('Comment added successfully!');
      setCommentContent('');
      setAuthorEmail('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleStatusChange = (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!id) return;
    updateTask({
      variables: {
        id,
        status: newStatus
      }
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !authorEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!id) return;

    addComment({
      variables: {
        taskId: id,
        content: commentContent,
        authorEmail: authorEmail
      }
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
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
        <span className="ml-3 text-gray-600">Loading task...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading task</h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.task) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Task not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              The task you're looking for doesn't exist or you don't have access to it.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const task = data.task;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link 
          to={`/projects/${task.project.id}`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {task.project.name}
        </Link>
      </div>

      {/* Task Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-600 mb-4">
              {task.description || 'No description provided'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                  {formatStatus(task.status)}
                </span>
              </div>
              
              {task.assigneeEmail && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium mr-2">Assignee:</span>
                  {task.assigneeEmail}
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium mr-2">Due:</span>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium mr-2">Created:</span>
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 lg:ml-6">
            <label className="form-label">Update Status</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
              className="form-select"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Comments ({task.comments?.length || 0})
          </h2>
        </div>

        <div className="p-6">
          {/* Add Comment Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="form-label">Your Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Comment *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Enter your comment"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={addingComment}
              >
                {addingComment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </button>
            </form>
          </div>

          {/* Comments List */}
          {!task.comments || task.comments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
              <p className="mt-1 text-sm text-gray-500">Be the first to comment on this task!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{comment.authorEmail}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
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

export default TaskDetail;