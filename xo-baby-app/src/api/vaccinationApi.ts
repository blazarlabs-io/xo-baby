import api from "./axios";

export interface CreateVaccinationPayload {
  date: string; // ISO date string, e.g. '2025-10-15'
  time: string; // Time string, e.g. '08:25'
  vaccineName: string; // Vaccine name (e.g., MMR, Polio)
  doseNumber?: string; // Dose number (e.g., "1st dose", "2nd dose")
  notes?: string; // Additional notes
  location?: string; // Hospital/clinic location
  administeredBy?: string; // Doctor/nurse name
  kidId: string; // Associated kid's ID
}

export interface Vaccination {
  id: string;
  date: string;
  time: string;
  vaccineName: string;
  doseNumber?: string;
  notes?: string;
  location?: string;
  administeredBy?: string;
  kidId: string;
  createdAt: string;
  updatedAt?: string;
}

export const createVaccination = async (
  token: string,
  data: CreateVaccinationPayload
): Promise<Vaccination> => {
  const response = await api.post<Vaccination>("/vaccination/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVaccinations = async (
  token: string,
  kidId: string,
  limit?: number
): Promise<Vaccination[]> => {
  const params: Record<string, string | number> = { kidId };
  if (limit !== undefined) params.limit = limit;

  const response = await api.get<Vaccination[]>("/vaccination/get-all", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const updateVaccination = async (
  token: string,
  vaccinationId: string,
  updates: Partial<CreateVaccinationPayload>
): Promise<Vaccination> => {
  const response = await api.put<Vaccination>(
    `/vaccination/update/${vaccinationId}`,
    updates,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteVaccination = async (
  token: string,
  vaccinationId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(
    `/vaccination/delete/${vaccinationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

