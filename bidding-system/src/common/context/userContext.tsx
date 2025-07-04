'use client';
import { createContext } from 'react';
import { User } from '../models/user';

type UserContextType = {
  user: User | undefined;
  loading: boolean;
  error: Error | null;
};

export const UserContext = createContext<UserContextType>({
  user: undefined,
  loading: true,
  error: null,
});

