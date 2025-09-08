"use client";

import { useEffect, useState, useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

import MealGrid from "@/components/MealsGrid";
import MarketToolbar from "@/components/MarketToolBar";

export default function MarketPage() {
  const { user, loading, createMeal, allStalls, filterStalls } = useContext(AuthContext);
  const [stalls, setStalls] = useState(null);
  const [loadingStalls, setLoadingStalls] = useState(true);

  // fetch Meals(Stalls)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await allStalls();
        if (active) setStalls(data);
      } finally {
        if (active) setLoadingStalls(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filter Bar
  const handleSearch = async (values) => {
    setLoadingStalls(true);
    try {
      if (!values?.zip) {
        const data = await allStalls();
        setStalls(data);
        return;
      }
      const data = await filterStalls({
        zip: values.zip,
        category: values.category,
        radius: values.radius,
      });
      setStalls(data);
    } catch (e) {
      console.error("Filter failed:", e?.response?.data || e);
    } finally {
      setLoadingStalls(false);
    }
  };

  // Adding meal
  const handleAddMeal = async (form) => {
    const role = user?.user?.role ?? user?.role;
    if (role !== "seller") return;

    try {
      const created = await createMeal(form);
      const data = await allStalls();
      setStalls(data);
      console.log("Meal created:", created);
    } catch (e) {
      console.error("Create meal failed:", e?.response?.data || e);
    }
  };

  return (
    <div className="mx-auto max-w-8xl px-4">
      {/* Filter bar and add Meal */}
      <MarketToolbar
        onSearch={handleSearch}
        onSubmit={handleAddMeal}
        preppr={user?.user?.role === "seller"}
      />

      {/* Cards */}
      {stalls && stalls.length ? (
        <MealGrid data={stalls} />
      ) : (
        <h1 className="text-gray-600 text-xl text-center">
          Sorry, we couldnt locate any options in your area.
        </h1>
      )}
    </div>
  );
}
