"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function ToSeller() {
  const { user, toSeller } = useContext(AuthContext);

  if (user?.user?.role !== "buyer") return null;

  return (
    <div className="flex justify-center p-6">
      <Button
        onClick={toSeller}
        className="bg-green-600 text-white px-4 py-2 rounded-xl"
      >
        Become Seller
      </Button>
    </div>
  );
}
