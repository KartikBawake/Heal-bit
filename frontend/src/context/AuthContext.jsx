import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const KEY = "healbit_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  // Rehydrate the session on first load so a refresh keeps you signed in.
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        setAuth(JSON.parse(raw));
      } catch {
        localStorage.removeItem(KEY);
      }
    }
    setReady(true);
  }, []);

  // data is the LoginResponse from the backend: { token, userId, name, email, role }
  const login = (data) => {
    const session = {
      token: data.token,
      user: { id: data.userId, name: data.name, email: data.email, role: data.role },
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setAuth(null);
  };

  const value = {
    auth,
    ready,
    login,
    logout,
    isAuthenticated: !!auth?.token,
    role: auth?.user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
