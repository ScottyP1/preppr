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
  const { aStall, loading } = useContext(AuthContext);
  const { id } = useParams();
  const [stall, setStall] = useState(null);

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

  if (loading) return <p className="px-4 py-8">Loading...</p>;
  if (!stall) return <p className="px-4 py-8">Item not found</p>;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 text-black md:pb-12 ">
      <SectionCard className="bg-gray-400/80">
        {/* Top section food img and description */}
        <MarketItemHeader stall={stall} />

        {/* Contains flags */}
        <ContainsFlags />

        {/* Details: Includes / Options */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailList
            title="Includes"
            lines={[
              "×7 salmon entries (1 serving each)",
              "×7 asparagus (1 serving each)",
            ]}
          />
          <DetailList
            title="Options"
            lines={["Single meal", "7-Day meal prep"]}
          />
        </div>

        {/* Nutrition */}
        <NutritionChart title="Nutrition (per serving)" />
      </SectionCard>

      {/* Special request */}
      <SpecialRequest />

      {/* request button on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-10 block bg-black/60 p-3 backdrop-blur md:hidden">
        <button className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white">
          Request This Meal
        </button>
      </div>
    </main>
  );
}
