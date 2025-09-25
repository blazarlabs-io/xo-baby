import api from "./axios";
import { UserRole } from "../constants/roles";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export const createUser = async (data: CreateUserPayload) => {
  const response = await api.post("/users/create", data);
  return response.data;
};

export const updateUserRole = async (uid: string, role: UserRole) => {
  const response = await api.put(`/users/${uid}/role`, { role });
  return response.data;
};
