import { useState, useCallback } from 'react';

type UseDeleteCollection = {
  deleteCollection: (id: string, onOptimisticUpdate?: () => void) => Promise<void>;
  loading: boolean;
};

export function useDeleteCollection(): UseDeleteCollection {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const deleteCollection = useCallback(
    async (id: string, onOptimisticUpdate?: () => void) => {
      setLoading(true);

      // Optimistic update first
      if (onOptimisticUpdate) {
        onOptimisticUpdate();
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { deleteCollection, loading };
}