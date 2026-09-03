import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";
import { translations } from "../utils/translations.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("setu_token") || null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem("setu_lang") || "en");

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("setu_lang", lang);
  };

  const t = useCallback(
    (key, replacements = {}) => {
      const langDict = translations[language] || translations.en;
      let text = langDict[key] || translations.en[key] || key;
      Object.keys(replacements).forEach((k) => {
        text = text.replace(new RegExp(`{${k}}`, "g"), replacements[k]);
      });
      return text;
    },
    [language]
  );

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn("Session check failed, clearing token", err);
        localStorage.removeItem("setu_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem("setu_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const quickDemoLogin = async (role = "asha") => {
    const res = await api.post("/auth/demo-login", { role });
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem("setu_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("setu_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "asha",
        token,
        isAuthenticated: !!user,
        loading,
        language,
        setLanguage: changeLanguage,
        t,
        login,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function useTranslation() {
  const { t, language, setLanguage } = useAuth();
  return { t, language, setLanguage };
}

