import { auth } from '../lib/firebase';

// Backend API URL
const API_BASE_URL = 'http://localhost:5000/api';

const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getCurrentUserToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response;
};

export const getAdminMetrics = async (): Promise<any> => {
  try {
    const response = await apiRequest('/admin/metrics', {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    throw error;
  }
};
