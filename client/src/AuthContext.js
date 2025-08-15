import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedToken) {
      setToken(savedToken);
      setUserEmail(savedEmail);
    }
  }, []);

  const login = (token, email) => {
    setToken(token);
    setUserEmail(email);
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider value={{ token, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
