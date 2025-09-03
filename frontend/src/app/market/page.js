"use client";

import { useEffect, useMemo, useState, useContext, useRef } from "react";

import { AuthContext } from "@/context/AuthContext";

import ProfileModal from "@/components/ProfileModal";
import MealGrid from "@/components/MealsGrid";
import MarketToolbar from "@/components/MarketToolBar";

const demoData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Grilled Salmon with Veggies",
    price: "14.99",
    preppr: false,
    tags: ["High Protein", "Fish"],
  },
];

export default function MarketPage() {
  const { user, loading, update } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);
  const needsProfile =
    !!user &&
    (!user.user?.first_name?.trim() ||
      !user.address?.trim() ||
      !`${user.zipcode ?? ""}`.trim());

  console.log(user);
  useEffect(() => {
    if (loading || !user || !needsProfile || shownRef.current) return;

    const key = `profilePrompt:${user.user?.id ?? user.id}`;
    if (!localStorage.getItem(key)) {
      setOpen(true);
      localStorage.setItem(key, "shown");
      shownRef.current = true;
    }
  }, [loading, user, needsProfile]);

  // Submit Updated User
  const handleSubmit = async (form) => {
    try {
      await update(form);
      setOpen(false);
    } catch (e) {
      console.error("Profile update failed:", e?.response?.data || e);
    }
  };

  const handleSearch = (values) => {
    console.log("search:", values);
  };

  const handleAddMeal = (data) => {
    if (user.role !== "seller") return;
    console.log(data);
  };

  return (
    <div className="mx-auto max-w-8xl px-4">
      {/* Filter bar and add Meal */}
      <MarketToolbar onSearch={handleSearch} onSubmit={handleAddMeal} />

      {/* Cards */}
      <MealGrid data={demoData} />

      {/* Profile modal */}
      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={user || {}}
      />
    </div>
  );
}
