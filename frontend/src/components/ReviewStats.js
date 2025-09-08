"use client";

import React from "react";

export default function ReviewStats() {
  // data declared as variables (you can change these numbers)
  const oneStar = 2;
  const twoStar = 1;
  const threeStar = 10;
  const fourStar = 17;
  const fiveStar = 22;

  const counts = [
    { stars: 5, count: fiveStar },
    { stars: 4, count: fourStar },
    { stars: 3, count: threeStar },
    { stars: 2, count: twoStar },
    { stars: 1, count: oneStar },
  ];

  const total = counts.reduce((s, c) => s + c.count, 0);
  const weighted = counts.reduce((s, c) => s + c.stars * c.count, 0);
  const avg = total === 0 ? 0 : weighted / total;
  const avgRounded = Math.round(avg * 10) / 10;

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  // helper to render star icons (filled for integer stars)
  const Star = ({ filled }) => (
    <svg
      className="w-4 h-4 inline-block"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.84-.197-1.54-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.063 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z"
      />
    </svg>
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start">
      {/* Left: horizontal bar chart */}
      <div className="w-full md:w-1/2 bg-white/30 p-4 rounded-2xl border border-gray-200">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold text-gray-400">{avgRounded}</div>
            <div className="flex items-center">
              {/* show filled stars by rounded value */}
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`mr-1 ${i < Math.round(avg) ? "text-yellow-500" : "text-gray-300"}`}
                  aria-hidden
                >
                  <Star filled={i < Math.round(avg)} />
                </span>
              ))}
            </div>
            <div className="ml-2 text-sm text-gray-500">({total} reviews)</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Average rating</div>
        </div>

        <div className="space-y-3">
          {counts.map((row) => {
            const pct = Math.round((row.count / maxCount) * 100);
            return (
              <div key={row.stars} className="flex items-center gap-3">
                <div className="w-10 text-sm text-gray-700 font-medium">{row.stars}★</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-green-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600">{row.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Recent review sample */}
      <div className="w-full md:w-1/2 bg-white/30 p-4 rounded-2xl border border-gray-200 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Reviews</h3>

          <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-400">Best Food Ever!</h4>
            <p className="text-sm text-gray-600 mt-2">
              The salmon was perfectly cooked and reheated well. Preppr was very quick to respond and was quick to inform
              me of any dietary restrictions. Would 100% order from this chef again!
            </p>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90"
          >
            See all {total} reviews
          </button>
        </div>
      </div>
    </div>
  );
}
