'use client';
import { ReactNode, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start as loading
  const [mounted, setMounted] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    const loadToken = () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(loadToken, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      const accessToken = data.access_token;
      
      setToken(accessToken);
      if (mounted) {
        localStorage.setItem('auth_token', accessToken);
      }
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    if (mounted) {
      localStorage.removeItem('auth_token');
    }
  };

  const isAuthenticated = !!token;

  // Always show loading until we've checked localStorage
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
