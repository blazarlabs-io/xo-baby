import api from "./axios";

export interface CreateDoctorDiagnosisPayload {
  date: string; // ISO date string, e.g. '2025-10-15'
  time: string; // Time string, e.g. '08:25'
  doctorName: string; // Doctor's name
  diagnosis: string; // Diagnosis title/type
  notes?: string; // Additional notes
  location?: string; // Hospital/clinic location
  kidId: string; // Associated kid's ID
}

export interface DoctorDiagnosis {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  diagnosis: string;
  notes?: string;
  location?: string;
  kidId: string;
  createdAt: string;
  updatedAt?: string;
}

export const createDoctorDiagnosis = async (
  token: string,
  data: CreateDoctorDiagnosisPayload
): Promise<DoctorDiagnosis> => {
  const response = await api.post<DoctorDiagnosis>("/doctor-diagnosis/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getDoctorDiagnoses = async (
  token: string,
  kidId: string,
  limit?: number
): Promise<DoctorDiagnosis[]> => {
  const params: Record<string, string | number> = { kidId };
  if (limit !== undefined) params.limit = limit;

  const response = await api.get<DoctorDiagnosis[]>("/doctor-diagnosis/get-all", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const updateDoctorDiagnosis = async (
  token: string,
  diagnosisId: string,
  updates: Partial<CreateDoctorDiagnosisPayload>
): Promise<DoctorDiagnosis> => {
  const response = await api.put<DoctorDiagnosis>(
    `/doctor-diagnosis/update/${diagnosisId}`,
    updates,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteDoctorDiagnosis = async (
  token: string,
  diagnosisId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(
    `/doctor-diagnosis/delete/${diagnosisId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

