import React, { useEffect, useState, createContext, useContext } from 'react';

type User = {
  id: string;
  userId: string;
  name: string;
  userName: string;
  email: string;
  role: string;
  jwt: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    const userName = localStorage.getItem('userName');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('id');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (jwt && userName && email && id && role && userId) {
      setUser({
        id,
        userId,
        name: userName,
        userName,
        email,
        role,
        jwt
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.role !== 'Admin') {
        throw new Error('Only admin users are allowed to access this system');
      }

      // Save user data to localStorage
      localStorage.setItem('jwt', data.jwt);
      localStorage.setItem('userName', data.userName);
      localStorage.setItem('email', data.email);
      localStorage.setItem('id', data.id.toString());
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);

      // Set user in state
      setUser({
        id: data.id.toString(),
        userId: data.userId,
        name: data.userName,
        userName: data.userName,
        email: data.email,
        role: data.role,
        jwt: data.jwt
      });

    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user,
            loading,
            login,
            logout,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};