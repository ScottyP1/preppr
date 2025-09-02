"use client";
import { useState } from "react";
import { IoIosAdd } from "react-icons/io";

import FilterBar from "@/components/FilterBar";
import Button from "@/components/Button";
import FoodForm from "./FoodForm";

export default function MarketToolbar({ onSearch, onSubmit }) {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [filters, setFilters] = useState({
    zip: "",
    category: "",
    radius: 10,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-[1fr_2fr_1fr] items-center py-3 relative">
      {/* mobile toggle */}
      <div className="relative">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="md:hidden flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2"
        >
          <span>Filters</span>
          <svg width="16" height="16" viewBox="0 0 20 20">
            <path
              d="M5 7l5 6 5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>

        {showFilters && (
          <div className="md:hidden absolute left-0 mt-2 w-[min(90vw,680px)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl z-10">
            <FilterBar
              onClick={() => onSearch(filters)}
              handleChange={handleFilterChange}
              inputs={[
                {
                  name: "zip",
                  placeholder: "Enter Zip",
                  value: filters.zip,
                  type: "number",
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* desktop filter bar */}
      <div className="hidden md:flex justify-center">
        <FilterBar
          onClick={() => onSearch(filters)}
          handleChange={handleFilterChange}
          inputs={[
            {
              name: "zip",
              placeholder: "Enter Zip",
              value: filters.zip,
              type: "number",
            },
          ]}
        />
      </div>

      {/* Right: add button */}
      <div className="justify-self-end text-black">
        <Button
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          onClick={() => setShowAddMeal((prev) => !prev)}
        >
          <IoIosAdd size={20} />
          <span>Post Meal</span>
        </Button>
      </div>

      {/* Meal Form */}
      {showAddMeal && (
        <FoodForm onClose={() => setShowAddMeal(false)} onSubmit={onSubmit} />
      )}
    </div>
  );
}
