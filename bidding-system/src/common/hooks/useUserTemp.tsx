import { useState, useEffect } from 'react';
import { User } from '../models/user';

export default function useUserTemp() {
  const [data, setData] = useState<User | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user data to test the UI
    setTimeout(() => {
      setData({
        id: 123,
        email: "owner1@example.com",
        name: "Collection Owner",
        role: "USER",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { data, error, loading };
}