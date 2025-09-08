"use client";

import { useState, useContext, useEffect } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import ProfileModal from "@/components/ProfileModal";
import MyStoreItem from "@/components/MyStoreItem";
import ReviewStats from "@/components/ReviewStats"; // if already present
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import ToSeller from "@/components/ToSeller"; // your existing component

export default function Account() {
  const {
    user,
    loading,
    allStalls,
    deleteMeal: ctxDeleteMeal,
  } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const tabs = ["My Store", "Orders", "Reviews", "Settings"];
  const [selectedTab, setSelectedTab] = useState("My Store");

  // My Store data
  const [myStalls, setMyStalls] = useState([]);
  const [loadingStalls, setLoadingStalls] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMyStore = async () => {
      if (selectedTab !== "My Store") return;
      setLoadingStalls(true);
      try {
        const data = await allStalls();
        if (!active) return;

        // helper to resolve seller id and user id robustly
        const getSellerId = (seller) =>
          seller?.id ??
          seller?.user?.id ??
          seller?.pk ??
          seller?.user_id ??
          null;
        const getUserId = () => user?.user?.id ?? user?.id ?? null;

        const uid = getUserId();
        const filtered = Array.isArray(data)
          ? data.filter((meal) => {
              const sid = getSellerId(meal?.seller ?? meal?.stall ?? null);
              return sid !== null && String(sid) === String(uid);
            })
          : [];

        setMyStalls(filtered);
      } catch (e) {
        console.error("Failed to fetch stalls:", e);
        setMyStalls([]);
      } finally {
        if (active) setLoadingStalls(false);
      }
    };

    fetchMyStore();
    return () => {
      active = false;
    };
  }, [selectedTab, allStalls, user]);

  const handleDelete = async (id) => {
    try {
      // prefer context delete if exposed by your AuthContext
      if (typeof ctxDeleteMeal === "function") {
        await ctxDeleteMeal(id);
      } else {
        // fallback: adjust the endpoint to match your Django route if needed
        const res = await fetch(`/api/stalls/${id}/`, { method: "DELETE" });
        if (!res.ok) {
          throw new Error("Delete request failed");
        }
      }
      setMyStalls((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
      // optionally show a UI toast here
    }
  };
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

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mt-6 gap-3">
        {tabs.map((label) => (
          <button
            key={label}
            onClick={() => setSelectedTab(label)}
            className={`p-4 rounded-xl text-center border ${
              selectedTab === label
                ? "bg-white border-gray-300 shadow"
                : "bg-gray-200 border-gray-200"
            }`}
          >
            <h2 className="text-black">{label}</h2>
          </button>
        ))}
      </div>

      {/* Content area - separate divs for each tab */}
      <div className="mt-3">
        {selectedTab === "My Store" && (
          <div className="bg-gray-300/80 border border-gray-300 w-full rounded-2xl p-4">
            <h3 className="text-lg text-gray-700 font-medium mb-3">
              Active Listings
            </h3>

            {loadingStalls ? (
              <div className="h-40 flex items-center justify-center">
                Loading… 
              </div>
            ) : myStalls && myStalls.length ? (
              <div className="flex flex-col gap-3">
                {myStalls.map((meal) => (
                  <MyStoreItem
                    key={meal.id}
                    item={meal}
                    onDelete={() => handleDelete(meal.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500">
                You have no items in your store right now.
              </div>
            )}
          </div>
        )}

        {selectedTab === "Orders" && (
          <div className="bg-gray-300/80 border border-gray-200 w-full rounded-2xl p-4 h-64 flex items-center justify-center text-gray-500">
            Your Orders Go Here
          </div>
        )}

        {selectedTab === "Reviews" && (
          <div className="bg-gray-300/80 border border-gray-200 w-full rounded-2xl p-4">
            <ReviewStats />
          </div>
        )}

        {/* ---- UPDATED Settings TAB ---- */}
        {selectedTab === "Settings" && (
          <div className="bg-gray-300/80 border border-gray-200 w-full rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: calendar */}
              <AvailabilityCalendar />

              {/* Right: Account Settings */}
              <div className="bg-white/30 p-4 rounded-2xl border border-gray-200 flex flex-col ">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Account Settings</h3>

                {/* Use your existing ToSeller button for buyers */}
                <div>
                  <ToSeller />
                </div>

                {/* If user is a seller, show Deactivate Seller Account flow */}
                {user?.user?.role === "seller" && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowDeactivateModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                      Deactivate Seller Account
                    </button>
                  </div>
                )}

                {/* Modal / dialog */}
                {showDeactivateModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-black/40"
                      onClick={() => setShowDeactivateModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-md w-full z-60 border border-gray-200">
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">
                        Are you sure?
                      </h4>
                      <p className="text-sm text-gray-700 mb-6">
                        Are you sure you want to deactivate your Preppr Account? This can not be undone.
                      </p>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowDeactivateModal(false)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white"
                        >
                          Delete Preppr Account
                        </button>
                        <button
                          onClick={() => setShowDeactivateModal(false)}
                          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ------------------------------ */}

        {selectedTab === "Settings" && null}

        {selectedTab === "Settings" && null}

        {selectedTab === "Settings" && null}

        {/* (Other tabs remain unchanged) */}
      </div>

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
