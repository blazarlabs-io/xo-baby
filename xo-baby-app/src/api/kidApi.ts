import api from "./axios";

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
  adminId?: string;
  doctorId?: string;
}

// POST
export const createKid = async (data: CreateKidPayload) => {
  const response = await api.post("/kid/create", data);
  return response.data;
};

// GET
export const getMyKids = async (uid: string) => {
  // const response = await api.get("/kid/my-kids", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });

  // Let the backend complete its heavy operations without artificial timeouts
  const response = await api.get(`/kid/my-kids-basic?uid=${uid}`);
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

// GET decrypted kid data from IPFS
export const getDecryptedKidData = async (
  kidId: string,
  aesKey: string,
  token: string
) => {
  const response = await api.get(`/kid/${kidId}/decrypted`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-aes-key": aesKey,
    },
  });
  return response.data;
};

// GET kid details with IPFS information
export const getKidDetails = async (kidId: string, token: string) => {
  const response = await api.get(`/kid/${kidId}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// POST height update
export const updateKidHeight = async (
  kidId: string,
  data: { date: string; height: number },
  token: string
) => {
  const response = await api.post(
    `/kid/${kidId}/height`,
    { date: data.date, height: data.height },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// GET height history
export const getHeightHistory = async (kidId: string, token: string) => {
  const response = await api.get(`/kid/${kidId}/height-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as { date: string; value: number }[];
};

// GET admin kids
export const getAdminKids = async (adminId: string) => {
  const response = await api.get(`/kid/admin-kids?adminId=${adminId}`);
  return response.data;
};

// GET medical personnel
export const getMedicalPersonnel = async () => {
  const response = await api.get("/kid/medical-personnel");
  return response.data;
};
