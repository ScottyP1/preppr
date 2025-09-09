"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.replace("/market");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-800">404 — Page not found</h1>
      <p className="mt-2 text-gray-600">Redirecting to the market in {count}…</p>
      <button
        className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-white"
        onClick={() => router.replace("/market")}
      >
        Go to Market now
      </button>
    </main>
  );
}

