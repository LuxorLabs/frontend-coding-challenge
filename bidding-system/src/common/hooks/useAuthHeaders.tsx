// src/common/hooks/useAuthHeaders.tsx
import { useAuth } from '../context/authContext';
import { useCallback } from 'react';

export function useAuthHeaders() {
  const { token, isHydrated } = useAuth();

  const getAuthHeaders = useCallback(() => {
    // Ensure we're hydrated and have a token
    if (!isHydrated || !token) {
      return {
        'Content-Type': 'application/json',
      };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    return headers;
  }, [token, isHydrated]);

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, requestOptions);

    return response;
  }, [getAuthHeaders]);

  return {
    getAuthHeaders,
    makeAuthenticatedRequest,
    hasToken: !!token,
    isReady: isHydrated && !!token,
  };
}