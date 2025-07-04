import { BidFormData } from '@/common/schemas/bidSchema';
import { useState, useCallback } from 'react';
import { Bid } from '@/common/models/bid';

type UseUpsertBid = {
  upsertBid: (data: BidFormData, onOptimisticUpdate?: (bid: Bid) => void) => Promise<void>;
  loading: boolean;
};

export function useUpsertBid(initialId?: number): UseUpsertBid {
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initialId);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const upsertBid = useCallback(
    async (bid: BidFormData, onOptimisticUpdate?: (bid: Bid) => void) => {
      
      setLoading(true);
      
      // Optimistic update first if callback provided
      if (onOptimisticUpdate && !isEdit) {
        const optimisticBid: Bid = {
          id: Date.now(), // Temporary ID
          price: bid.price,
          status: 'PENDING',
          collectionId: bid.collectionId,
          userId: 'temp-user',
          user: {
            id: 'temp',
            name: 'You',
            email: 'temp@temp.com'
          }
        };
        onOptimisticUpdate(optimisticBid);
      }
      
      try {
        const url = isEdit
          ? `/bids/${initialId}`
          : '/bids';
        const method = isEdit ? 'PATCH' : 'POST';
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
          method,
          headers: getAuthHeaders(),
          body: JSON.stringify(bid),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        await res.json();
        
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [initialId, isEdit],
  );

  return { upsertBid, loading };
}
