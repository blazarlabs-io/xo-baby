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

// POST with retry mechanism
export const createKid = async (data: CreateKidPayload, retryCount = 0): Promise<any> => {
  const maxRetries = 2;

  try {
    console.log(`Creating kid (attempt ${retryCount + 1}/${maxRetries + 1})...`);

    const response = await api.post('/kid/create', data, {
      timeout: 300000, // 5 minutes timeout for very long blockchain operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Kid created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Create kid attempt ${retryCount + 1} failed:`, error);

    // Check if it's a network error and we haven't exceeded max retries
    if (retryCount < maxRetries && (
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.response?.status >= 500
    )) {
      console.log(`Retrying in 5 seconds... (attempt ${retryCount + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return createKid(data, retryCount + 1);
    }

    // If it's not a retryable error or we've exceeded max retries, throw the error
    throw error;
  }
};

// Request cache to prevent duplicate concurrent requests
const requestCache = new Map<string, Promise<any>>();

// GET with request deduplication
export const getMyKids = async (token: string) => {
  const cacheKey = `getMyKids-${token}`;

  // If there's already a request in progress with this token, return it
  if (requestCache.has(cacheKey)) {
    console.log('🔄 Returning cached request for getMyKids');
    return requestCache.get(cacheKey);
  }

  console.log('🚀 Making new getMyKids request');

  // Create new request
  const requestPromise = api.get('/kid/my-kids', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(response => {
    // Remove from cache when completed
    requestCache.delete(cacheKey);
    return response.data;
  }).catch(error => {
    // Remove from cache on error too
    requestCache.delete(cacheKey);
    throw error;
  });

  // Store in cache
  requestCache.set(cacheKey, requestPromise);

  return requestPromise;
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

