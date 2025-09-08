"use client";

import SectionCard from "./SectionCard";

// Renders a simple horizontal bar chart for common nutrition keys.
// Starts at 0 for all metrics and fills based on provided `data`.
const NutritionChart = ({ title = "Nutrition", data }) => {
  const keys = ["Carbs", "Protein", "Fat", "Calories"];

  const read = (obj, names) => {
    for (const n of names) {
      const v = obj?.[n];
      if (v != null) return v;
    }
    return undefined;
  };

  // Accept various name variants from API payloads
  const normalized = {
    Carbs: Number(
      read(data, ["Carbs", "carbs", "carbohydrates", "carbs_g"]) ?? 0
    ),
    Protein: Number(read(data, ["Protein", "protein", "protein_g"]) ?? 0),
    Fat: Number(read(data, ["Fat", "fat", "fat_g"]) ?? 0),
    Calories: Number(read(data, ["Calories", "calories", "kcal"]) ?? 0),
  };

  const entries = keys.map((k) => [k, normalized[k]]);
  const max = Math.max(1, ...entries.map(([, v]) => (isFinite(v) ? v : 0)));

  return (
    <SectionCard className="md:col-span-2">
      <h4 className="mb-2 text-sm font-semibold md:text-base">{title}</h4>
      <div className="space-y-3">
        {entries.map(([label, value]) => {
          const safe = isFinite(value) ? value : 0;
          const pct = Math.round((safe / max) * 100);
          return (
            <div key={label}>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums">{safe}</span>
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
