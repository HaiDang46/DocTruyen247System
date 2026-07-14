"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUserByIdDb, isDbConnected } from "./actions";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("doc_truyen_user");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        
        // Refresh from DB
        isDbConnected().then(connected => {
          if (connected && parsedUser?.id) {
            getUserByIdDb(parsedUser.id).then(res => {
              if (res.success && res.data) {
                setUser(res.data);
                sessionStorage.setItem("doc_truyen_user", JSON.stringify(res.data));
              } else {
                console.error("getUserByIdDb failed:", res.error);
              }
            }).catch(e => {
              console.error("getUserByIdDb threw:", e);
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("doc_truyen_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("doc_truyen_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
