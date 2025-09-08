"use client";

import React from "react";

export default function AvailabilityCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const monthName = today.toLocaleString("default", { month: "long" });

  // number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // compute first day (converted to Monday-start index: 0=Mon ... 6=Sun)
  const firstDayRaw = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  const firstDayIndex = (firstDayRaw + 6) % 7; // shift so Monday=0

  // create an array representing calendar cells (blanks + day numbers)
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // helper to detect weekend (true if Sat or Sun)
  const isWeekend = (year, month, day) => {
    const wk = new Date(year, month, day).getDay(); // 0=Sun, 6=Sat
    return wk === 0 || wk === 6;
  };

  // weekday header labels (Mon -> Sun)
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white/30 p-4 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-gray-700">{monthName} {year}</div>
          <div className="text-xs text-gray-500">Set your weekly availability</div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded-sm bg-green-400 border border-green-600" />
            <span className="text-xs text-gray-600">Available for Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded-sm bg-gray-300 border border-gray-400" />
            <span className="text-xs text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((w) => (
          <div key={w} className="text-xs text-center text-gray-500">
            {w}
          </div>
        ))}

        {cells.map((val, i) => {
          if (val === null) {
            // empty cell before month start
            return <div key={`e-${i}`} className="h-12" />;
          }

          const weekend = isWeekend(year, month, val);
          const isToday =
            val === today.getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          const baseClasses = "h-12 flex items-center justify-center rounded-lg text-sm";
          const bgClass = weekend ? "bg-gray-200 text-gray-700" : "bg-green-200 text-green-900";
          const todayRing = isToday ? "ring-2 ring-indigo-500 font-semibold" : "";

          return (
            <div
              key={val}
              className={`${baseClasses} ${bgClass} ${todayRing}`}
              title={val}
            >
              {val}
            </div>
          );
        })}
      </div>

      {/* Set Availability button */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90"
        >
          Set Availability
        </button>
      </div>
    </div>
  );
}
