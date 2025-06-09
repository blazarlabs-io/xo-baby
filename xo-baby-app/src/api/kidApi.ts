import api from './axios';

interface CreateKidPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  ethnicity?: string;
  location?: string;
  congenitalAnomalies?: { name: string; description?: string }[];
  avatarUrl?: string;
  parentId: string;
}

// POST
export const createKid = async (data: CreateKidPayload) => {
  const response = await api.post('/kids/create', data);
  return response.data;
};

// GET
export const getMyKids = async (token: string) => {
  const response = await api.get('/kids/my-kids', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
