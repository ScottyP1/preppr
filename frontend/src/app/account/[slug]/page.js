"use client";

import { useEffect, useMemo, useState, useContext } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import MealsGrid from "@/components/MealsGrid";
import ReviewStats from "@/components/ReviewStats";

function slugifyName(first = "", last = "") {
  const base = `${(first || "").trim()} ${(last || "").trim()}`.trim();
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function PublicAccountPage() {
  const { slug } = useParams();
  const { allStalls } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await allStalls();
        if (!active) return;

        const all = Array.isArray(data) ? data : [];

        // Accept either numeric id in slug or name-based slug
        let targetId = null;
        if (/^\d+$/.test(slug)) {
          targetId = slug;
        } else {
          const maybeId = slug.match(/-(\d+)$/)?.[1];
          if (maybeId) targetId = maybeId;
        }

        let filtered = [];
        if (targetId) {
          filtered = all.filter((m) => {
            const sid = m?.seller?.id ?? m?.seller?.user?.id ?? m?.seller?.user_id ?? null;
            return sid != null && String(sid) === String(targetId);
          });
        } else {
          // Fallback: match by slugified name
          filtered = all.filter((m) => {
            const s = m?.seller || {};
            const nm = slugifyName(s.first_name, s.last_name);
            return nm === slug;
          });
        }

        setItems(filtered);
      } catch (e) {
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, allStalls]);

  const sellerInfo = useMemo(() => {
    if (!items.length) return null;
    return items[0]?.seller || null;
  }, [items]);

  return (
    <main className="max-w-6xl mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-gray-300/80 p-4 rounded-2xl">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200">
          <Image
            src={sellerInfo?.avatar || "/default-avatar.png"}
            alt="Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-800">
            {sellerInfo ? `${sellerInfo.first_name || ""} ${sellerInfo.last_name || ""}`.trim() : "Profile"}
          </h1>
          <p className="text-sm text-gray-600">
            {items?.length || 0} posted item{(items?.length || 0) === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Items */}
      <section className="mt-6">
        <h2 className="text-gray-700 font-medium">Posted Items</h2>
        {loading ? (
          <div className="mt-4 text-gray-500">Loading…</div>
        ) : items.length ? (
          <MealsGrid data={items} />
        ) : (
          <div className="mt-4 text-gray-500">No items found for this user.</div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-gray-700 font-medium mb-3">Reviews</h2>
        <div className="bg-gray-300/80 border border-gray-200 w-full rounded-2xl p-4">
          <ReviewStats />
        </div>
      </section>
    </main>
  );
}

