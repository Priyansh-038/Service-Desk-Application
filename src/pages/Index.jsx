import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import Dashboard from '../components/dashboard/Dashboard';

const Index = () => {
  const { currentUser } = useAuth();

  return currentUser ? <Dashboard /> : <AuthForm />;
};

export default Index;