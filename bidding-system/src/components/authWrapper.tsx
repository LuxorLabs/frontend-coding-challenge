'use client';
import { useState } from 'react';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';

export default function AuthWrapper() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
  }

  return <LoginForm onGoToRegister={() => setShowRegister(true)} />;
}
