"use client";
import { useRouter } from "next/navigation";

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
  apiGetAStall,
  apiDeleteMeal,
  apiFilterStalls,
  apiGetCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiCheckoutCart,
  apiGetBuyerOrders,
  apiGetSellerOrders,
  apiSetOrderItemStatus,
} from "@/lib/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);

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

  const refreshUser = useCallback(async () => {
    const role = user?.user?.role;
    const fresh =
      role === "seller" ? await apiGetSeller() : await apiGetBuyer();
    setUser(fresh);
  }, [user]);

  const handleUpdateUser = useCallback(
    async (form) => {
      try {
        const role = user?.user?.role;
        let fresh;

        if (role === "seller") {
          await apiUpdateSeller(form);
          fresh = await apiGetSeller();
        } else if (role === "buyer") {
          await apiUpdateBuyer(form);
          fresh = await apiGetBuyer();
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

  const handleUpdateBaseUser = useCallback(
    async (form) => {
      try {
        await apiUpdateAccount(form);
        await refreshUser();
      } catch (e) {
        console.log(e);
      }
    },
    [refreshUser]
  );

  const handleLogin = useCallback(
    async (form) => {
      try {
        const { access: a, refresh: r } = await apiLogin(form);

        setAccess(a);
        setRefresh(r);
        // Used for protected routes
        document.cookie = `access=${a}; path=/; SameSite=Lax`;

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
    setCart(null);
  }, []);

  const router = useRouter();

  // Cart helpers
  const refreshCart = useCallback(async () => {
    try {
      const data = await apiGetCart();
      setCart(data);
      return data;
    } catch (e) {
      // ignore if not buyer or not logged in
      return null;
    }
  }, []);

  const addToCart = useCallback(async ({ stall_id, quantity = 1 }) => {
    const data = await apiAddToCart({ stall_id, quantity });
    setCart(data);
    return data;
  }, []);

  const updateCartItem = useCallback(async ({ item_id, quantity }) => {
    const data = await apiUpdateCartItem({ item_id, quantity });
    setCart(data);
    return data;
  }, []);

  const removeCartItem = useCallback(async ({ item_id }) => {
    const data = await apiRemoveCartItem({ item_id });
    setCart(data);
    return data;
  }, []);

  const checkoutCart = useCallback(async () => {
    const order = await apiCheckoutCart();
    setCart(null); // new cart will be created on next refresh
    return order;
  }, []);

  // Orders helpers
  const getBuyerOrders = useCallback(async () => {
    return apiGetBuyerOrders();
  }, []);

  const getSellerOrders = useCallback(async () => {
    return apiGetSellerOrders();
  }, []);

  const setOrderItemStatus = useCallback(async ({ order_item_id, status }) => {
    return apiSetOrderItemStatus({ order_item_id, status });
  }, []);

  const handleBecomeSeller = async () => {
    try {
      const profile = await apiBecome_seller();

      // Refresh user state
      const [userData, sellerData] = await Promise.all([
        apiGetUser(),
        apiGetSeller(),
      ]);
      setUser({ user: userData, ...sellerData });

      router.push("/market");

      return true;
    } catch (err) {
      console.error("Failed to become seller:", err);
      throw err;
    }
  };
  const value = useMemo(
    () => ({
      user,
      access,
      refresh,
      loading,
      cart,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      update: handleUpdateUser,
      updateBase: handleUpdateBaseUser,
      toSeller: handleBecomeSeller,
      createMeal: apiCreateMeal,
      allStalls: apiGetAllStalls,
      aStall: apiGetAStall,
      deleteMeal: apiDeleteMeal,
      filterStalls: apiFilterStalls,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      checkoutCart,
      getBuyerOrders,
      getSellerOrders,
      setOrderItemStatus,
    }),
    [user, access, refresh, loading, cart, handleLogin, handleRegister, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
