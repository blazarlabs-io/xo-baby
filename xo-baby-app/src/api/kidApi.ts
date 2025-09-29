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
    console.log(`🚀 Attempting to create kid (attempt ${retryCount + 1}):`, data);
    console.log(`📡 Making request to: ${api.defaults.baseURL}/kid/create`);
    
    const response = await api.post('/kid/create', data, {
      timeout: 900000, // 15 minutes timeout for blockchain operations
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`✅ Kid creation successful:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Create kid attempt ${retryCount + 1} failed:`, error);
    console.error(`❌ Error status:`, error.response?.status);
    console.error(`❌ Error message:`, error.message);
    console.error(`❌ Error config:`, error.config?.url);
    
    // Check if it's a network error and we haven't exceeded max retries
    if (retryCount < maxRetries && (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.response?.status >= 500 ||
      error.response?.status === 404
    )) {
      console.log(`🔄 Retrying in 10 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 10000));
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

// GET with request deduplication and extended timeout
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

  // Create new request with extended timeout
  const requestPromise = api.get('/kid/my-kids', {
    timeout: 900000, // 15 minutes timeout for blockchain operations
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(response => {
    requestCache.delete(cacheKey);
    console.log('✅ getMyKids request successful:', response.data);
    return response.data;
  }).catch(error => {
    requestCache.delete(cacheKey);
    console.error('❌ getMyKids request failed:', error);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
    throw error;
  });

  requestCache.set(cacheKey, requestPromise);
  return requestPromise;
};

// GET weight history
export const getWeightHistory = async (kidId: string, token: string) => {
  const response = await api.get(`/kid/${kidId}/weight-history`, {
    timeout: 300000, // 5 minutes for regular operations
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
      timeout: 300000, // 5 minutes for regular operations
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

