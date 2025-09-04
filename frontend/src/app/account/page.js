// app/account/page.jsx (or wherever your Account component lives)
"use client";

import { useState, useContext, useMemo, useEffect } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import ProfileModal from "@/components/ProfileModal";

export default function Account() {
  const { user, loading } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  if (loading) return <h1 className="p-4">Loading…</h1>;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 mt-6">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 bg-gray-300/80 p-4 rounded-2xl">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
          {user?.user && (
            <Image
              src={user?.user?.avatar}
              alt="Profile avatar"
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="rounded-2xl object-cover"
              priority
            />
          )}
        </div>

        <div className="flex-1 text-black">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold text-lg">
              {user?.user?.first_name} {user?.user?.last_name}
            </h2>
            <button
              className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90"
              onClick={() => setOpen(true)}
            >
              Update Account
            </button>
          </div>

          <p className="mt-2 leading-relaxed text-sm sm:text-base">
            {user?.user?.bio && user.user.bio}
          </p>
        </div>
      </div>

      {/* Tabs & content (your existing stuff) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mt-6 gap-3">
        {["My Store", "Orders", "Reviews", "Settings"].map((label) => (
          <div
            key={label}
            className="bg-gray-200 border border-gray-200 p-4 rounded-xl text-center"
          >
            <h2 className="text-black">{label}</h2>
          </div>
        ))}
      </div>
      <div className="bg-gray-100 border border-gray-200 w-full h-64 mt-3 rounded-2xl" />

      {open && (
        <ProfileModal
          initial={{
            avatar: user?.user?.avatar,
            first_name: user?.user?.first_name || "",
            last_name: user?.user?.last_name || "",
            bio: user?.user?.bio || "",
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
