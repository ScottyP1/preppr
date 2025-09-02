"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  apiLogin,
  apiRegister,
  apiGetUser,
  apiUpdateUser,
  apiRefresh,
  setTokens,
  clearTokens,
  getAccess,
  getRefresh,
} from "@/lib/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from storage
  useEffect(() => {
    const a = getAccess();
    const r = getRefresh();
    if (a) setAccess(a);
    if (r) setRefresh(r);
    setLoading(false);
  }, []);

  // Fetch user when we have access
  useEffect(() => {
    if (!access) {
      setUser(null);
      return;
    }
    (async () => {
      try {
        const user = await apiGetUser();
        setUser(user);
      } catch {
        setUser(null);
      }
    })();
  }, [access]);

  // Actions
  const handleUpdateUser = useCallback(async (form) => {
    const { user } = await apiUpdateUser(form);
    setUser(user || (await apiGetUser()));
  }, []);

  const handleLogin = useCallback(async (form) => {
    try {
      const { access, refresh, user } = await apiLogin(form);

      setTokens(access, refresh);
      setAccess(access);
      setRefresh(refresh);
      setUser(user || (await apiGetUser()));

      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  const handleRegister = useCallback(async (form) => {
    await apiRegister(form);
  }, []);

  const handleLogout = useCallback(() => {
    clearTokens();
    setAccess(null);
    setRefresh(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      access,
      refresh,
      loading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      update: handleUpdateUser,
    }),
    [user, access, refresh, loading, handleLogin, handleRegister, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
