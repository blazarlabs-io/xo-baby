import api from "./axios";

/** Payload for creating a new task */
export interface CreateTaskPayload {
  date: string; // ISO date string, e.g. '2025-07-15'
  time: string; // Time string, e.g. '08:25'
  name: string; // Task title
  description: string; // Task description
  kidId: string; // Associated kid's ID
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

export const createTask = async (
  data: CreateTaskPayload,
  uid: string
): Promise<Task> => {
  const response = await api.post<Task>("/task/create", data, {
    params: { uid },
  });
  return response.data;
};

export const getTasks = async (
  kidId: string,
  limit?: number,
  uid?: string
): Promise<Task[]> => {
  const params: Record<string, string | number> = { kidId };
  if (limit !== undefined) params.limit = limit;
  if (uid) params.uid = uid;

  const response = await api.get<Task[]>("/task/get-all", {
    params,
  });
  return response.data;
};

export const updateTask = async (
  taskId: string,
  updates: Partial<CreateTaskPayload>
): Promise<Task> => {
  const response = await api.patch<Task>(`/task/update/${taskId}`, updates);
  return response.data;
};

export const deleteTask = async (
  taskId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(
    `/task/delete/${taskId}`
  );
  return response.data;
};
