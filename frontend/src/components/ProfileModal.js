"use client";

import { useContext, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { FaEdit, FaTimes } from "react-icons/fa";
import Image from "next/image";
import AvatarPicker from "./AvatarPicker";

function ProfileModal({ initial, onClose }) {
  const { updateBase } = useContext(AuthContext);

  const [form, setForm] = useState({
    avatar: initial.avatar,
    first_name: initial.first_name,
    last_name: initial.last_name,
    bio: initial.bio,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      setSaving(true);
      await updateBase(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="h-full w-full flex items-stretch sm:items-center justify-center">
        {/* Fullscreen on mobile; centered card on desktop */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white text-black w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl sm:shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Update Account</h3>
            <button
              type="button"
              aria-label="Close"
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-5 py-5 space-y-6">
            {/* Centered Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden">
                <Image
                  src={form.avatar || "/avatar/default.png"}
                  alt="Selected avatar"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              {/* Preset Avatars */}
              <div className="w-full">
                <p className="text-sm text-gray-600 mb-2">choose a avatar</p>
                <div className="flex justify-center">
                  <AvatarPicker
                    onChange={handleChange}
                    value={form.avatar}
                    name="avatar"
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />
              <Field
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell people a bit about you…"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
