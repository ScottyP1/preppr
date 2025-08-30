"use client";
import { useState } from "react";

export default function ProfileModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    address: "",
    zip: "",
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white/[.4] rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-black">
          Complete your profile
        </h2>
        <CustomInput
          name="f_name"
          placeholder="First name"
          value={form.f_name}
          onChange={handleChange}
        />
        <CustomInput
          name="l_name"
          placeholder="Last name"
          value={form.l_name}
          onChange={handleChange}
        />
        <CustomInput
          name="address"
          placeholder="Street address"
          value={form.address}
          onChange={handleChange}
        />
        <CustomInput
          name="zip"
          placeholder="ZIP code"
          value={form.zip}
          onChange={handleChange}
        />
        <div className="flex gap-2 justify-evenly">
          <button
            className="px-3 py-2 w-full border-2 rounded-lg border-[#82FF82] text-black"
            onClick={onClose}
          >
            Not now
          </button>
          <button
            className="bg-[#82FF82] text-black px-3 py-2 rounded w-full"
            onClick={() => onSubmit(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const CustomInput = ({ name, placeholder, value, onChange }) => {
  return (
    <input
      name={name}
      placeholder={placeholder}
      className="border p-2 w-full rounded-lg bg-white text-black"
      value={value}
      onChange={onChange}
    />
  );
};
