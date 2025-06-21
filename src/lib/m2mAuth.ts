// Machine-to-Machine Authentication utility for Via Diseño API

interface M2MConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

// Mock configuration - in a real app, these would come from environment variables
const config: M2MConfig = {
  apiUrl: process.env.VIA_DISENO_API_URL || 'https://api.viadiseno.com',
  clientId: process.env.VIA_DISENO_CLIENT_ID || 'mock_client_id',
  clientSecret: process.env.VIA_DISENO_CLIENT_SECRET || 'mock_client_secret'
};

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get a valid access token for M2M authentication
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  try {
    // Request a new token
    const response = await fetch(`${config.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'read:users'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }
    
    const data = await response.json();
    accessToken = data.access_token;
    
    // Set expiry time (subtract 5 minutes for safety)
    const expiresInMs = (data.expires_in - 300) * 1000;
    tokenExpiry = Date.now() + expiresInMs;
    
    if (!accessToken) {
      throw new Error('No access token received from API');
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error getting M2M access token:', error);
    throw new Error('Failed to authenticate with Via Diseño API');
  }
}

/**
 * Make an authenticated request to the Via Diseño API
 */
export async function authenticatedRequest<T>(endpoint: string): Promise<T> {
  try {
    const token = await getAccessToken();
    
    // For development/demo purposes, return mock data
    if (config.clientId === 'mock_client_id') {
      return getMockResponse<T>(endpoint);
    }
    
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Authenticated request error:', error);
    throw error;
  }
}

/**
 * Mock response for development/demo purposes
 */
function getMockResponse<T>(endpoint: string): T {
  console.log(`Mock API call to: ${endpoint}`);
  
  // Extract id from endpoint
  const ivdIdMatch = endpoint.match(/ivd_id=(\d+)/);
  const userIdMatch = endpoint.match(/\/v1\/users\/(\d+)/);
  
  if (ivdIdMatch) {
    const ivdId = parseInt(ivdIdMatch[1]);
    return {
      data: {
        id: Math.floor(Math.random() * 1000),
        uid: `user_${ivdId}`,
        ivd_id: ivdId,
        name: 'Usuario',
        first_surname: 'Demo',
        second_surname: 'Test',
        email: `user.${ivdId}@institution.edu`,
        status: 'active',
        type: 'student',
        semester: 6,
        regular: true,
        role: {
          id: 1,
          name: 'student',
          description: 'Student role',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } as T;
  }
  
  if (userIdMatch) {
    return {
      data: {
        irregular: false,
        regular: true
      }
    } as T;
  }
  
  // Default mock response
  return {
    data: null,
    error: 'Mock endpoint not implemented'
  } as T;
}

/**
 * Clear the cached access token (useful for testing or forced refresh)
 */
export function clearAccessToken(): void {
  accessToken = null;
  tokenExpiry = 0;
}
