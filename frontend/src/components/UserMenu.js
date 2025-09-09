"use client";

import React, { useRef, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext"; // <-- updated path

export default function UserMenu({ onClose }) {
  const { logout } = useContext(AuthContext) || {};
  const router = useRouter();
  const menuRef = useRef();

  // Close when clicked outside
  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  const handleLogout = () => {
    logout?.();
    onClose?.();
    router.push("/login");
  };

  const itemClass =
    "block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-black";

  return (
    <div
      ref={menuRef}
      className="absolute right-4 top-full mt-2 w-48 bg-white text-black rounded-2xl shadow-lg ring-1 ring-black/5 z-50"
      role="menu"
      aria-orientation="vertical"
      aria-label="User menu"
    >
      <div className="py-2">
        <Link href="/account" onClick={onClose} className={itemClass}>
          Account
        </Link>
        <Link href="/account?tab=orders" onClick={onClose} className={itemClass}>
          Orders
        </Link>
        <Link href="/support" onClick={onClose} className={itemClass}>
          Support
        </Link>
        <button
          onClick={handleLogout}
          className={`${itemClass} w-full text-left`}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
