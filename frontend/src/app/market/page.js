"use client";

import { useEffect, useMemo, useState, useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

import ProfileModal from "@/components/ProfileModal";
import FoodCard from "@/components/FoodCard";
import FilterBar from "@/components/FilterBar";

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
  const { user, loading, handleUpdateUser } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    zip: "",
    category: "",
    radius: 10,
  });
  const [open, setOpen] = useState(false);

  // Conditional to render Profile Modal
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

  // Handle User modal update
  const handleSubmit = async (form) => {
    try {
      await handleUpdateUser(form);

      setOpen(false);
    } catch (e) {
      console.error("Profile update failed:", e?.response?.data || e);
    }
  };

  // // Handle the filterbar inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilter = () => {
    console.log(filters);
  };

  return (
    <div className="pb-12">
      {/* Top level filter Bar */}
      <FilterBar
        onClick={handleFilter}
        handleChange={handleChange}
        inputs={[
          {
            name: "zip",
            placeholder: "Enter Zip",
            value: filters.zip,
            type: "number",
          },
        ]}
      />

      {/* Map thru all demo data and render FoodCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12 px-4">
        {demoData.map((item) => (
          <FoodCard {...item} key={item.id} />
        ))}
      </div>

      {/* Appears after login/signup to prompt user to finish setting up account/ sets localStorage on response */}
      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={user || {}}
      />
    </div>
  );
}
