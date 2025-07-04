export const getAuthHeaders = () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json',
      };
    }
    
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };
  
  export const apiClient = {
    get: async (url: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return response;
    },
    
    post: async (url: string, data?: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        ...(data && { body: JSON.stringify(data) }),
      });
      return response;
    },
    
    patch: async (url: string, data?: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        ...(data && { body: JSON.stringify(data) }),
      });
      return response;
    },
    
    delete: async (url: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return response;
    },
  };