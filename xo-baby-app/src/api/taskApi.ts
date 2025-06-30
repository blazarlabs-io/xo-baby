import api from './axios';

/** Payload for creating a new task */
export interface CreateTaskPayload {
  date: string;         // ISO date string, e.g. '2025-07-15'
  time: string;         // Time string, e.g. '08:25'
  name: string;         // Task title
  description: string;  // Task description
  kidId: string;        // Associated kid's ID
}

/** Represents a task returned from the API */
export interface Task {
  id: string;
  date: string;
  time: string;
  name: string;
  description: string;
  kidId: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create a new task
 * @param token Authorization bearer token
 * @param data CreateTaskPayload
 * @returns Created Task
 */
export const createTask = async (
  token: string,
  data: CreateTaskPayload
): Promise<Task> => {
  const response = await api.post<Task>('/task/create', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch tasks for a specific kid
 * @param token Authorization bearer token
 * @param kidId ID of the kid whose tasks to fetch
 * @param limit Optional maximum number of tasks to return
 */
export const getTasks = async (
  token: string,
  kidId: string,
  limit?: number
): Promise<Task[]> => {
  const params: Record<string, string | number> = { kidId };
  if (limit !== undefined) params.limit = limit;

  const response = await api.get<Task[]>('/task/get-all', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

/**
 * Update an existing task
 * @param token Authorization bearer token
 * @param taskId ID of the task to update
 * @param updates Partial fields to update
 */
export const updateTask = async (
  token: string,
  taskId: string,
  updates: Partial<CreateTaskPayload>
): Promise<Task> => {
  const response = await api.patch<Task>(`/task/update/${taskId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Delete a task by ID
 * @param token Authorization bearer token
 * @param taskId ID of the task to delete
 */
export const deleteTask = async (
  token: string,
  taskId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/task/delete/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
