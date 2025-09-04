"use client";

import { useMemo } from "react";

import SectionCard from "./SectionCard";

const NutritionChart = ({ title = "Nutrition", data = {} }) => {
  const nutrition = useMemo(() => {
    return { Carbs: 45, Protein: 32, Fat: 18, Calories: 520 };
  }, []);

  const entries = Object.entries(nutrition || {});
  const max = Math.max(
    1,
    ...entries.map(([, v]) => (typeof v === "number" ? v : parseFloat(v) || 0))
  );

  return (
    <SectionCard className="md:col-span-2">
      <h4 className="mb-2 text-sm font-semibold md:text-base">{title}</h4>
      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-black/70">No nutrition data.</p>
        )}
        {entries.map(([label, rawVal]) => {
          const value =
            typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
          const pct = Math.round((value / max) * 100);
          return (
            <div key={label}>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums">{value}</span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-black/10">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default NutritionChart;
