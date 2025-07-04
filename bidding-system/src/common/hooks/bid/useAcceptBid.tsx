import { useState, useCallback } from 'react';

type UseAcceptBid = {
  acceptBid: (collectionId: string, bidId: number, onOptimisticUpdate?: () => void) => Promise<void>;
  loading: boolean;
};

export function useAcceptBid(): UseAcceptBid {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const acceptBid = useCallback(
    async (collectionId: string, bidId: number, onOptimisticUpdate?: () => void) => {
      setLoading(true);

      // Optimistic update first
      if (onOptimisticUpdate) {
        onOptimisticUpdate();
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids/accept/${collectionId}/${bidId}`, {
          method: 'POST',
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

  return { acceptBid, loading };
}
