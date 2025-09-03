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
  apiGetSeller,
  apiUpdateAccount,
  apiUpdateBuyer,
  apiUpdateSeller,
  apiBecome_seller,
  apiGetBuyer,
  apiRefresh,
  setTokens,
  apiCreateMeal,
  apiGetAllStalls,
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

    if (user && user.user) return;

    let cancelled = false;
    (async () => {
      try {
        const base = await apiGetUser();
        if (cancelled) return;

        const fresh =
          base.role === "seller"
            ? await apiGetSeller()
            : base.role === "buyer"
            ? await apiGetBuyer()
            : base;

        if (!cancelled) setUser(fresh);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [access, user, setUser]);

  // Actions
  const handleUpdateUser = useCallback(
    async (form) => {
      try {
        const role =
          user?.user?.role ?? user?.role ?? (await apiGetUser()).role;

        let fresh;
        if (role === "seller") {
          await apiUpdateSeller(form);
          fresh = await apiGetSeller();
        } else if (role === "buyer") {
          await apiUpdateBuyer(form);
          fresh = await apiGetBuyer();
        } else {
          await apiUpdateAccount(form);
          fresh = await apiGetUser();
        }

        setUser(fresh);
        return true;
      } catch (err) {
        console.error("Update failed:", err);
        throw err;
      }
    },
    [user]
  );

  const handleLogin = useCallback(
    async (form) => {
      try {
        const { access: a, refresh: r } = await apiLogin(form);

        setAccess(a);
        setRefresh(r);

        // 2) Get role
        const baseUser = await apiGetUser(); // { id, email, role, ... }

        // 3) Hit role-specific endpoint and set exactly what it returns
        if (baseUser.role === "seller") {
          const sellerPayload = await apiGetSeller(); // already includes `user`
          setUser(sellerPayload);
        } else if (baseUser.role === "buyer") {
          const buyerPayload = await apiGetBuyer(); // already includes `user`
          setUser(buyerPayload);
        } else {
          // fallback if some other role has no dedicated endpoint
          setUser(baseUser);
        }

        return true;
      } catch (err) {
        console.error("Login failed:", err);
        throw err;
      }
    },
    [setAccess, setRefresh, setUser]
  );

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
      toSeller: apiBecome_seller,
      create: apiCreateMeal,
      allStalls: apiGetAllStalls,
    }),
    [user, access, refresh, loading, handleLogin, handleRegister, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
