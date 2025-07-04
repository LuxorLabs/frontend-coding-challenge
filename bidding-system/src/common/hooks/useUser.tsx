import { useState, useEffect } from 'react';
import { User } from '../models/user';
import { useAuth } from './useAuth';

export default function useUser() {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<User | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset state when not authenticated
    if (!isAuthenticated || !token) {
      setData(undefined);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const fetchUser = async () => {
      try {
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const userData: User = await res.json();
        
        if (!isCancelled) {
          setData(userData);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isCancelled = true;
    };
  }, [token, isAuthenticated]);

  return { data, error, loading };
}
