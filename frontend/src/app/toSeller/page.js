"use client";

import { useContext } from "react";

import Button from "@/components/Button";
import { AuthContext } from "@/context/AuthContext";

export default function ToSeller() {
  const { toSeller } = useContext(AuthContext);
  return (
    <div>
      <Button onClick={() => toSeller()}>Become Seller</Button>
    </div>
  );
}
