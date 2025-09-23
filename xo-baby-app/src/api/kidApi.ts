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
    const response = await api.post('/kid/create', data, {
      timeout: 300000, // 5 minutes timeout for very long blockchain operations
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
      await new Promise(resolve => setTimeout(resolve, 5000));
      return createKid(data, retryCount + 1);
    }

    throw error;
  }
};

const requestCache = new Map<string, Promise<any>>();

// Clear the request cache (useful after creating/updating kids)
export const clearKidsCache = () => {
  requestCache.clear();
};

// GET with request deduplication
export const getMyKids = async (token: string, forceRefresh: boolean = false) => {
  const cacheKey = `getMyKids-${token}`;

  // If force refresh is requested, clear the cache first
  if (forceRefresh) {
    requestCache.delete(cacheKey);
  }

  // If there's already a request in progress with this token, return it
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  // Create new request
  const requestPromise = api.get('/kid/my-kids', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(response => {
    requestCache.delete(cacheKey);
    return response.data;
  }).catch(error => {
    requestCache.delete(cacheKey);
    console.error('❌ getMyKids request failed:', error);
    throw error;
  });

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

