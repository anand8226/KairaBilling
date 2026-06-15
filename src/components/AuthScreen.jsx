import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

export default function AuthScreen({ onLoginSuccess, initialMode = 'login', onBackToWebsite }) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'register'

  // Ensure state matches external initialMode change if any
  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  // Sync auth mode changes with browser URL hash
  useEffect(() => {
    window.location.hash = authMode === 'login' ? 'login' : 'signup';
  }, [authMode]);

  if (authMode === 'login') {
    return (
      <LoginScreen 
        onLoginSuccess={onLoginSuccess} 
        onSwitchToSignup={() => setAuthMode('register')} 
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  return (
    <SignupScreen 
      onSwitchToLogin={() => setAuthMode('login')} 
      onBackToWebsite={onBackToWebsite}
    />
  );
}
