// src/common/hooks/collection/useCollection.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../useAuth';

export default function useCollection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchCollections = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const collections = await response.json();
      
      setData(collections);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch collections'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refetch = useCallback(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (token) {
      fetchCollections();
    }
  }, [token, fetchCollections]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}