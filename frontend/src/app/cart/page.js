"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import SectionCard from "@/components/SectionCard";

export default function CartPage() {
  const { user, cart, refreshCart, updateCartItem, removeCartItem, checkoutCart } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await refreshCart();
      } catch (e) {
        setError("Unable to load cart.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshCart]);

  const items = cart?.items || [];
  const totalCents = items.reduce((sum, it) => sum + (it?.stall?.price_cents || 0), 0);
  const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

  const [updatingId, setUpdatingId] = useState(null);

  const handleQty = async (item, next) => {
    if (next <= 0) return;
    try {
      setUpdatingId(item.id);
      await updateCartItem({ item_id: item.id, quantity: next });
    } catch (e) {
      setError(e?.response?.data?.quantity || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeCartItem({ item_id: item.id });
    } catch (e) {
      setError("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await checkoutCart();
      // naive success. You could route to /orders or show a receipt.
      alert("Order placed! Total: " + fmt(order?.total_cents || 0));
      await refreshCart();
    } catch (e) {
      setError(e?.response?.data?.detail || "Checkout failed");
    }
  };

  if (!user) return <div className="mx-auto max-w-6xl px-4 py-8 text-black">Please sign in to view your cart.</div>;
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-black">Loading cart…</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 text-black md:pb-12">
      <h1 className="text-xl font-semibold">Your Cart</h1>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      <SectionCard>
        {items.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-black/70">Your cart is empty.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-xl bg-white/90 p-3">
                <div>
                  <div className="font-medium">{it?.stall?.product || "Item"}</div>
                  <div className="text-sm text-black/70">{fmt(it?.stall?.price_cents || 0)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="ml-3 rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                    onClick={() => handleRemove(it)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Total: {fmt(totalCents)}</div>
        <button
          disabled={items.length === 0}
          onClick={handleCheckout}
          className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Place Order
        </button>
      </div>
    </main>
  );
}
