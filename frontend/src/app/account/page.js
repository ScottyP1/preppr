"use client";

import { useState, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(() => {
    const tabParam = searchParams?.get("tab")?.toLowerCase();
    if (tabParam === "orders") return "Orders";
    if (tabParam === "reviews") return "Reviews";
    if (tabParam === "settings") return "Settings";
    return "My Store";
  });

  useEffect(() => {
    const tabParam = searchParams?.get("tab")?.toLowerCase();
    if (tabParam === "orders") setSelectedTab("Orders");
    else if (tabParam === "reviews") setSelectedTab("Reviews");
    else if (tabParam === "settings") setSelectedTab("Settings");
    else setSelectedTab("My Store");
  }, [searchParams]);

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

          <OrdersPanel />

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
            // profile fields (role-specific)
            location: user?.location || "",
            address: user?.address || "",
            zipcode: user?.zipcode ?? "",
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function OrdersPanel() {
  const { user, getBuyerOrders, getSellerOrders, setOrderItemStatus } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerItems, setSellerItems] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        if (user?.user?.role === "buyer") {
          const orders = await getBuyerOrders();
          if (active) setBuyerOrders(Array.isArray(orders) ? orders : []);
        } else if (user?.user?.role === "seller") {
          const items = await getSellerOrders();
          if (active) setSellerItems(Array.isArray(items) ? items : []);
        }
      } catch (e) {
        if (active) setError("Failed to load orders");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, getBuyerOrders, getSellerOrders]);

  if (loading) return <div className="bg-gray-100 border border-gray-200 w-full rounded-2xl p-4 text-gray-500">Loading…</div>;
  if (error) return <div className="bg-gray-100 border border-gray-200 w-full rounded-2xl p-4 text-rose-600">{error}</div>;

  if (user?.user?.role === "buyer") {
    return (
      <div className="bg-gray-300/80 border border-gray-300 w-full rounded-2xl p-4">
        <h3 className="text-lg text-gray-700 font-medium mb-3">My Orders</h3>
        {buyerOrders.length === 0 ? (
          <div className="text-gray-500">You have no orders.</div>
        ) : (
          <div className="space-y-4">
            {buyerOrders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Order #{o.id}</div>
                  <div className="text-xs text-black/70">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-3 divide-y">
                  {o.items?.map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{it.product_name}</span>
                        <span className="text-xs text-black/60">Qty: {it.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">${(it.price_cents/100).toFixed(2)}</span>
                        {it.status === "accepted" && (
                          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">Accepted</span>
                        )}
                        {it.status === "declined" && (
                          <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs">Chef declined</span>
                        )}
                        {it.status === "new" && (
                          <span className="rounded-full bg-gray-200 text-gray-700 px-2 py-0.5 text-xs">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <div className="text-sm text-black/70">Total</div>
                  <div className="text-base font-semibold">${(o.total_cents/100).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Seller view
  return (
    <div className="bg-gray-300/80 border border-gray-300 w-full rounded-2xl p-4">
      <h3 className="text-lg text-gray-700 font-medium mb-3">Incoming Orders</h3>
      {sellerItems.length === 0 ? (
        <div className="text-gray-500">No incoming orders.</div>
      ) : (
        <div className="space-y-3">
          {sellerItems.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-sm">
              <div>
                <div className="font-medium text-gray-700">{it.product_name}</div>
                <div className="text-xs text-gray-700">Buyer: {it.buyer?.first_name} {it.buyer?.last_name}</div>
              </div>
              <div className="flex items-center gap-2">
                {it.status === "new" ? (
                  <>
                    <button
                      className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                      onClick={async () => {
                        await setOrderItemStatus({ order_item_id: it.id, status: "declined" });
                        setSellerItems((prev) => prev.map((x) => x.id === it.id ? { ...x, status: "declined" } : x));
                      }}
                    >
                      Decline
                    </button>
                    <button
                      className="rounded-xl bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
                      onClick={async () => {
                        await setOrderItemStatus({ order_item_id: it.id, status: "accepted" });
                        setSellerItems((prev) => prev.map((x) => x.id === it.id ? { ...x, status: "accepted" } : x));
                      }}
                    >
                      Accept
                    </button>
                  </>
                ) : it.status === "accepted" ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">Accepted</span>
                ) : (
                  <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs">Declined</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
