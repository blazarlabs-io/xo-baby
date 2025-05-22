import api from './axios';

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const createUser = async (data: CreateUserPayload) => {
  const response = await api.post('/users', data);
  return response.data;
};
