"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";

import SectionCard from "@/components/SectionCard";
import NutritionChart from "@/components/NutritionChart";
import SpecialRequest from "@/components/SpecialRequestBar";
import ContainsFlags from "@/components/ContainsFlags";
import DetailList from "@/components/DetailList";
import MarketItemHeader from "@/components/MarketItemHeader";

export default function MarketItemPage() {
  const { aStall, loading, addToCart, user, cart, refreshCart } = useContext(AuthContext);
  const { id } = useParams();
  const [stall, setStall] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await aStall(id);
        setStall(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id, aStall]);

  // Ensure we know what's in the cart for disabling the button
  useEffect(() => {
    if (user?.user?.role === "buyer" && !cart) {
      refreshCart?.().catch(() => {});
    }
  }, [user, cart, refreshCart]);

  const inCart = useMemo(() => {
    if (!cart || !stall) return false;
    return (cart.items || []).some((it) => String(it?.stall?.id) === String(stall.id));
  }, [cart, stall]);

  if (loading) return <p className="px-4 py-8">Loading...</p>;
  if (!stall) return <p className="px-4 py-8">Item not found</p>;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 text-black md:pb-12 ">
      <SectionCard className="bg-gray-400/80">
        {/* Top section food img and description */}
        <MarketItemHeader stall={stall} />

        {/* Contains flags from backend allergens */}
        <ContainsFlags items={(stall?.allergens || []).map((a) => a?.name).filter(Boolean)} />

        {/* Details: Includes / Options from backend */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailList title="Includes" lines={stall?.includes || []} />
          <DetailList title="Options" lines={stall?.options || []} />
        </div>

        {/* Nutrition */}
        <NutritionChart title="Nutrition (per serving)" data={stall?.nutrition || stall} />
      </SectionCard>

      {/* Buyer actions */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {user?.user?.role === "buyer" ? (
          <>
            <button
              disabled={adding || inCart}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              onClick={async () => {
                setAddError("");
                setAdding(true);
                try {
                  await addToCart({ stall_id: stall.id, quantity: 1 });
                } catch (e) {
                  const msg = e?.response?.data?.detail || e?.message || "Failed to add to cart";
                  setAddError(String(msg));
                } finally {
                  setAdding(false);
                }
              }}
            >
              {inCart ? "Item in Cart" : adding ? "Adding…" : "Add to Cart"}
            </button>
            {addError && (
              <span className="text-sm text-rose-600">{addError}</span>
            )}
          </>
        ) : !user?.user ? (
          <a
            href="/login"
            className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600"
          >
            Sign in to Add
          </a>
        ) : null}
      </div>

      {/* request button on mobile (repurposed as Add to Cart for buyers) */}
      {user?.user?.role === "buyer" && (
        <div className="fixed inset-x-0 bottom-0 z-10 block bg-black/60 p-3 backdrop-blur md:hidden">
          <button
            disabled={adding || inCart}
            onClick={async () => {
              setAddError("");
              setAdding(true);
              try {
                await addToCart({ stall_id: stall.id, quantity: 1 });
              } catch (e) {
                const msg = e?.response?.data?.detail || e?.message || "Failed to add to cart";
                setAddError(String(msg));
              } finally {
                setAdding(false);
              }
            }}
            className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white disabled:opacity-50"
          >
            {inCart ? "Item in Cart" : adding ? "Adding…" : "Add to Cart"}
          </button>
          {addError && (
            <p className="mt-2 text-center text-sm text-rose-500">{addError}</p>
          )}
        </div>
      )}
    </main>
  );
}
