import { auth } from '../lib/firebase';

const API_BASE_URL = 'http://localhost:5000/api';

// Get current user's Firebase token
const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    // For simplified backend, return null instead of throwing error
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

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getCurrentUserToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Only add Authorization header if token exists (for simplified backend)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
};

// Chat API
export const sendMessageToAI = async (
  message: string,
  conversationHistory: Array<{role: string; content: string}> = [],
  language: string = 'en'
): Promise<{ response: string; timestamp: string }> => {
  try {
    const response = await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationHistory,
        language
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

// Get conversation history
export const getConversations = async (): Promise<Array<{
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}>> => {
  try {
    const response = await apiRequest('/conversations', {
      method: 'GET',
    });

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Delete conversation
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await apiRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (): Promise<any> => {
  try {
    const response = await apiRequest('/user/profile', {
      method: 'GET',
    });

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Check backend health
export const checkBackendHealth = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const response = await apiRequest('/health', {
      method: 'GET',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking backend health:', error);
    throw error;
  }
};

// Track feature/page usage
export const trackUsage = async (payload: { feature?: string; page?: string }): Promise<void> => {
  try {
    await apiRequest('/track', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Tracking should not break the app
  }
};

// Admin metrics
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
