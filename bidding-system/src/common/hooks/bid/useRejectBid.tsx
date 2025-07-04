import { useState, useCallback } from 'react';

type UseRejectBid = {
  rejectBid: (collectionId: string, bidId: number, onOptimisticUpdate?: () => void) => Promise<void>;
  loading: boolean;
};

export function useRejectBid(): UseRejectBid {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const rejectBid = useCallback(
    async (collectionId: string, bidId: number, onOptimisticUpdate?: () => void) => {
      setLoading(true);

      // Optimistic update first
      if (onOptimisticUpdate) {
        onOptimisticUpdate();
      }

      try {
        // Use the dedicated reject endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/reject/${collectionId}/${bidId}`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
        }
        
        const result = await res.json();
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { rejectBid, loading };
}