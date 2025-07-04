'use client';
import { ReactNode } from "react";
import { UserContext } from "../context/userContext";
import useUser from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: user, loading, error } = useUser();

  // Always provide context, but handle unauthenticated state
  const contextValue = {
    user: isAuthenticated ? user : undefined,
    loading: isAuthenticated ? loading : false,
    error: isAuthenticated ? error : null,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
