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
  const { user, loading, update, create, allStalls } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [stalls, setStalls] = useState(null);
  const [loadingStalls, setLoadingStalls] = useState(true);
  const shownRef = useRef(false);

  const needsProfile =
    !!user &&
    (!user.user?.first_name?.trim() ||
      !user.address?.trim() ||
      !`${user.zipcode ?? ""}`.trim());

  useEffect(() => {
    if (loading || !user || !needsProfile || shownRef.current) return;

    const key = `profilePrompt:${user.user?.id ?? user.id}`;
    if (!localStorage.getItem(key)) {
      setOpen(true);
      localStorage.setItem(key, "shown");
      shownRef.current = true;
    }
  }, [loading, user, needsProfile]);

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

  const handleAddMeal = async (form) => {
    const role = user?.user?.role ?? user?.role;
    if (role !== "seller") return;

    try {
      const created = await create({
        product: form.product.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        tags: form.tags,
        image: form.image,
        location: user.location || "N/A",
      });
      console.log("Meal created:", created);
    } catch (e) {
      console.error("Create meal failed:", e?.response?.data || e);
    }
  };
  console.log(user);
  return (
    <div className="mx-auto max-w-8xl px-4">
      {/* Filter bar and add Meal */}
      <MarketToolbar
        onSearch={handleSearch}
        onSubmit={handleAddMeal}
        preppr={user}
      />

      {/* Cards */}
      {!loadingStalls && <MealGrid data={demoData} />}

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
