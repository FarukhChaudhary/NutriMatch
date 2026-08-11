import { createContext, useContext, useState } from 'react';
import { USERS } from '../data/mockData';

const AuthContext = createContext(null);

// Simulated auth — in production would call JWT API
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Demo: match by email against mock users, password ignored
    const found = USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      return { success: true };
    }
    return { success: false, error: 'auth.loginError' };
  };

  const register = (name, email, role, organization) => {
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      organization: organization || null,
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  const isNGO = user?.role === 'ngo';
  const isDonor = user?.role === 'donor';
  const isManager = user?.role === 'program_manager';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isNGO, isDonor, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
