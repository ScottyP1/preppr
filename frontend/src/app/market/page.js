"use client";

import { useEffect, useMemo, useState, useContext } from "react";

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
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Classic Cheeseburger",
    price: "9.99",
    preppr: true,
    tags: ["Beef", "Comfort Food"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Vegan Buddha Bowl",
    price: "11.50",
    preppr: false,
    tags: ["Vegan", "Healthy"],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Chicken Alfredo Pasta",
    price: "12.75",
    preppr: true,
    tags: ["Italian", "Chicken"],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Avocado Toast",
    price: "7.25",
    preppr: false,
    tags: ["Vegetarian", "Breakfast"],
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Pepperoni Pizza",
    price: "13.50",
    preppr: true,
    tags: ["Pizza", "Cheese"],
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Avocado Toast",
    price: "7.25",
    preppr: false,
    tags: ["Vegetarian", "Breakfast"],
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Pepperoni Pizza",
    price: "13.50",
    preppr: true,
    tags: ["Pizza", "Cheese"],
  },
];

export default function MarketPage() {
  const { user, loading, update } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [mealModal, setMealModal] = useState(false);

  const needsProfile = useMemo(() => {
    if (!user) return false;
    return !user.name || !user.address || !user.zip;
  }, [user]);

  // Used to display user modal
  useEffect(() => {
    if (loading || !user) return;

    const key = `profilePrompt:${user.id}`;
    const alreadyShown = localStorage.getItem(key);

    if (needsProfile && !alreadyShown) {
      setOpen(true);
      localStorage.setItem(key, "shown");
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
