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
  const response = await api.post('/kid/create', data);
  return response.data;
};

// GET
export const getMyKids = async (token: string) => {
  const response = await api.get('/kid/my-kids', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// GET weight history
export const getWeightHistory = async (kidId: string, token: string) => {
  const response = await api.get(`/kid/${kidId}/weight-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as { date: string; value: number }[];
};

// POST a new weight record
export const updateKidWeight = async (
  kidId: string,
  data: { date: string; weight: number },
  token: string
) => {
  const response = await api.post(
    `/kid/${kidId}/weight`,
    { date: data.date, weight: data.weight },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

