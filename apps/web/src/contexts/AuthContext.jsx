
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least 1 uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least 1 lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least 1 number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least 1 special character');
    }
    return errors;
  };

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    return authData;
  };

  const loginWithGoogle = (onSuccess, onError) => {
    pb.collection('users').authWithOAuth2({ provider: 'google' })
      .then((authData) => {
        setCurrentUser(authData.record);
        if (onSuccess) onSuccess(authData);
      })
      .catch((err) => {
        if (onError) onError(err);
      });
  };

  const signup = async (userData) => {
    const record = await pb.collection('users').create({
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm,
      name: userData.name,
      surname: userData.surname,
      phone: userData.phone,
      cpf: userData.cpf,
      address: userData.address,
    }, { $autoCancel: false });
    
    // Auto-login after signup
    const authData = await pb.collection('users').authWithPassword(userData.email, userData.password);
    setCurrentUser(authData.record);
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const updateProfile = async (userId, data) => {
    const updated = await pb.collection('users').update(userId, data, { $autoCancel: false });
    setCurrentUser(updated);
    return updated;
  };

  const value = {
    currentUser,
    initialLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    validatePassword,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
