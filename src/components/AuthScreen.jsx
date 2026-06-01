import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

export default function AuthScreen({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  if (authMode === 'login') {
    return (
      <LoginScreen 
        onLoginSuccess={onLoginSuccess} 
        onSwitchToSignup={() => setAuthMode('register')} 
      />
    );
  }

  return (
    <SignupScreen 
      onSwitchToLogin={() => setAuthMode('login')} 
    />
  );
}
