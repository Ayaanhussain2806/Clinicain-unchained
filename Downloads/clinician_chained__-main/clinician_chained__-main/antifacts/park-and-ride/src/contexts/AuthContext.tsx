import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getStoredUser, setStoredUser, setToken, removeToken, StoredUser } from "@/lib/auth";

interface AuthContextType {
  user: StoredUser | null;
  setAuth: (token: string, user: StoredUser) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(getStoredUser);

  const setAuth = useCallback((token: string, newUser: StoredUser) => {
    setToken(token);
    setStoredUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setAuth, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
