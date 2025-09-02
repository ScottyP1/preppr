"use client";
import { useState, useMemo } from "react";

const TAG_OPTIONS = [
  { value: "high-protein", label: "High Protein" },
  { value: "low-carb", label: "Low Carb" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "dairy-free", label: "Dairy Free" },
  { value: "seafood", label: "Seafood" },
  { value: "bbq", label: "BBQ" },
];

const FoodForm = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    tags: [],
    image: null,
    imagePreview: null,
  });
  const [showTagPicker, setShowTagPicker] = useState(false);

  const labelFor = useMemo(
    () => Object.fromEntries(TAG_OPTIONS.map((t) => [t.value, t.label])),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const toggleTag = (value) => {
    setForm((prev) => {
      const has = prev.tags.includes(value);
      const next = has
        ? prev.tags.filter((v) => v !== value)
        : [...prev.tags, value];
      return { ...prev, tags: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 text-black">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Add New Meal</h1>

        {/* Image Preview */}
        <div className="mb-4 flex flex-col items-center">
          {form.imagePreview ? (
            <img
              src={form.imagePreview}
              alt="Preview"
              className="w-48 h-32 object-cover rounded-md mb-2 border"
            />
          ) : (
            <div className="w-48 h-32 bg-gray-200 flex items-center justify-center rounded mb-2">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded-xl"
          />
        </div>

        {/* Title */}
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 border rounded"
        />

        {/* Description */}
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full mb-3 p-2 border rounded"
        />

        {/* Price */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full mb-3 p-2 border rounded"
        />

        {/* Tags */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium">Tags</label>
            <button
              type="button"
              onClick={() => setShowTagPicker((s) => !s)}
              className="text-sm px-3 py-1 rounded-xl border hover:bg-gray-50"
            >
              {showTagPicker ? "Hide tags" : "Select tags"}
            </button>
          </div>

          {/* Selected chips */}
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {labelFor[v]}
                  <button
                    type="button"
                    onClick={() => toggleTag(v)}
                    className="leading-none"
                    aria-label={`Remove ${labelFor[v]}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag grid */}
          {showTagPicker && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TAG_OPTIONS.map((t) => {
                const active = form.tags.includes(t.value);
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => toggleTag(t.value)}
                    className={`px-3 py-2 rounded-xl border text-sm transition
                    ${
                      active
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodForm;
