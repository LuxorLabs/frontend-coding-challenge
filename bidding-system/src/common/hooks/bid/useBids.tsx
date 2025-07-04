import { useState, useEffect, useCallback, useRef } from "react";
import { Bid } from "../../models/bid";
import { apiClient } from "../../utils/apiClient";

export default function useBids(collectionId: string) {
  const [data, setData] = useState<Bid[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!collectionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/bids?collectionId=${collectionId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: Bid[] = await res.json();
      if (isMounted.current) {
        setData(json);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [collectionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}