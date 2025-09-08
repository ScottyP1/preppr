"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/context/AuthContext";

import SectionCard from "@/components/SectionCard";
import NutritionChart from "@/components/NutritionChart";
import ContainsFlags from "@/components/ContainsFlags";
import DetailList from "@/components/DetailList";

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

const ALLERGEN_OPTIONS = [
  { value: "Fish", label: "Fish" },
  { value: "Dairy", label: "Dairy" },
  { value: "Soy", label: "Soy" },
  { value: "Gluten", label: "Gluten" },
  { value: "Eggs", label: "Eggs" },
  { value: "Peanuts", label: "Peanuts" },
  { value: "Tree Nuts", label: "Tree Nuts" },
  { value: "Shellfish", label: "Shellfish" },
];

const OPTION_CHOICES = [
  { value: "Single meal", label: "Single meal" },
  { value: "7-Day meal prep", label: "7-Day meal prep" },
];

export default function CreateMealPage() {
  const router = useRouter();
  const { user, createMeal, allStalls } = useContext(AuthContext);

  const [form, setForm] = useState({
    product: "",
    description: "",
    price: "",
    price_level: "",
    tags: [],
    allergens: [],
    image: null,
    imagePreview: null,
    location: "",
    includes: "",
    optionsSelected: [],
    // nutrition (per serving). Protein is UI-only for now.
    calories: 0,
    carbs_g: 0,
    fat_g: 0,
    protein_g: 0,
    submitting: false,
    error: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const labelFor = useMemo(
    () => Object.fromEntries(TAG_OPTIONS.map((t) => [t.value, t.label])),
    []
  );

  // Prefill and lock location from seller profile
  useEffect(() => {
    const sellerLoc = user?.location || user?.user?.location || "";
    if (sellerLoc && sellerLoc !== form.location) {
      setForm((p) => ({ ...p, location: sellerLoc }));
    }
  }, [user, form.location]);
  const sellerLocation = user?.location || user?.user?.location || "";
  const sellerAddress = user?.address || user?.user?.address || "";
  const sellerZip = user?.zipcode ?? user?.user?.zipcode ?? "";
  const missingLocation = !String(sellerLocation || "").trim();
  const missingZip = sellerZip === null || sellerZip === undefined || String(sellerZip).trim() === "";

  const toggleTag = (value) => {
    setForm((prev) => {
      const has = prev.tags.includes(value);
      const next = has
        ? prev.tags.filter((v) => v !== value)
        : [...prev.tags, value];
      return { ...prev, tags: next };
    });
  };

  const toggleAllergen = (value) => {
    setForm((prev) => {
      const has = prev.allergens.includes(value);
      const next = has
        ? prev.allergens.filter((v) => v !== value)
        : [...prev.allergens, value];
      return { ...prev, allergens: next };
    });
  };

  const toggleOption = (value) => {
    setForm((prev) => {
      const has = prev.optionsSelected.includes(value);
      const next = has
        ? prev.optionsSelected.filter((v) => v !== value)
        : [...prev.optionsSelected, value];
      return { ...prev, optionsSelected: next };
    });
  };

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

  const parseLines = (text) =>
    (text || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

  const calcCalories = (carbs, protein, fat) =>
    Math.max(
      0,
      Math.round((Number(carbs) || 0) * 4 + (Number(protein) || 0) * 4 + (Number(fat) || 0) * 9)
    );

  const setMacro = (name, value) => {
    setForm((p) => {
      const next = { ...p, [name]: value };
      next.calories = calcCalories(next.carbs_g, next.protein_g, next.fat_g);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side required checks
    const errs = {};
    if (!form.image) errs.image = "Please add a photo of your meal.";
    if (!form.product?.trim()) errs.product = "Title is required.";
    if (!form.price || isNaN(parseFloat(form.price))) errs.price = "Price is required.";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setForm((p) => ({ ...p, error: Object.values(errs)[0] }));
      return;
    }
    setFieldErrors({});
    setForm((p) => ({ ...p, submitting: true, error: null }));
    try {
      const payload = {
        product: form.product,
        description: form.description,
        price: form.price,
        price_level: form.price_level || undefined,
        location: form.location,
        image: form.image,
        tags: form.tags,
        allergens: form.allergens,
        calories: form.calories,
        fat_g: form.fat_g,
        carbs_g: form.carbs_g,
        protein_g: form.protein_g,
        includes: parseLines(form.includes),
        options: form.optionsSelected,
      };

      const created = await createMeal(payload);
      // Refresh list and route back to market
      try {
        await allStalls();
      } catch {}
      if (created && typeof created === "object" && created.id != null) {
        router.push(`/market/`);
      } else {
        // Backend create returns write-serializer without id; fall back to index
        router.push("/market");
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fe = {};
        for (const [k, v] of Object.entries(data)) {
          fe[k] = Array.isArray(v) ? v.join(" ") : String(v);
        }
        setFieldErrors(fe);
        const firstMsg = Object.values(fe)[0] || "Create failed";
        setForm((p) => ({ ...p, error: firstMsg }));
      } else {
        const msg = err?.message || "Failed to create";
        setForm((p) => ({ ...p, error: msg }));
      }
    } finally {
      setForm((p) => ({ ...p, submitting: false }));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 text-black md:pb-12">
      <form onSubmit={handleSubmit}>
        <SectionCard className="bg-gray-400/80">
          {/* Top section: image + details (mirrors [id] layout) */}
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Image uploader/preview */}
            <div
              className={`relative w-full overflow-hidden rounded-xl md:w-1/2 md:h-[360px] bg-black/10 flex items-center justify-center ${
                fieldErrors.image ? "ring-2 ring-rose-500" : ""
              }`}
              style={{ aspectRatio: "4 / 3" }}
            >
              {form.imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-black/60">Upload a photo</div>
              )}

              <label className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1 text-sm shadow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="cursor-pointer">Choose Image</span>
              </label>
              {fieldErrors.image && (
                <div className="absolute bottom-3 right-3 rounded bg-rose-600/90 px-2 py-1 text-xs text-white">
                  {fieldErrors.image}
                </div>
              )}
            </div>

            {/* right card */}
            <div
              className="grid w-full rounded-xl bg-gray-300/80 p-3 md:w-1/2 md:p-4 grid-rows-[auto,1fr,auto]"
              style={{ height: 360 }}
            >
              {/* Seller preview */}
              <div className="flex items-start gap-3">
                {user?.avatar && (
                  <Image
                    src={user.avatar}
                    width={44}
                    height={44}
                    alt="Your avatar"
                    className="rounded-full"
                  />
                )}
                <div className="font-medium">
                  {(user?.first_name || user?.user?.first_name) ?? ""}{" "}
                  {(user?.last_name || user?.user?.last_name) ?? ""}
                </div>
              </div>

              {/* description */}
              <div className="mt-3 overflow-y-auto pr-1">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your meal"
                  className="h-40 w-full resize-none rounded-xl border border-black/20 bg-white/90 p-2 text-sm outline-none md:text-base"
                />
              </div>

              {/* Product name */}
              <div className="mt-3 border-t border-black/10 pt-2 text-sm font-semibold md:text-base">
                <input
                  type="text"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  placeholder="Product name"
                  className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 font-semibold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Basics */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">
                Basics
              </h4>
              <div className="grid gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price (e.g. 12.99)"
                  className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 outline-none"
                />
                <div className="space-y-3">
                  {/* Hide raw lat/lng; show human-friendly address/zip only */}
                  {missingLocation && (
                    <p className="mt-1 text-xs text-rose-600">
                      Add your city/state in Account settings before posting a meal.
                    </p>
                  )}
                  <input
                    type="text"
                    name="address"
                    value={sellerAddress}
                    readOnly
                    placeholder="Address (from Account)"
                    className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 outline-none disabled:opacity-60"
                    disabled
                  />
                  <input
                    type="number"
                    name="zipcode"
                    value={sellerZip}
                    readOnly
                    placeholder="Zip code (from Account)"
                    className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 outline-none disabled:opacity-60"
                    disabled
                  />
                  {missingZip && (
                    <p className="mt-1 text-xs text-rose-600">
                      Add your zip code in Account settings to improve filtering.
                    </p>
                  )}
                </div>
                <input
                  type="number"
                  name="price_level"
                  value={form.price_level}
                  onChange={handleChange}
                  placeholder="Price Level (optional)"
                  className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 outline-none"
                />
              </div>
            </SectionCard>

            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">Tags</h4>
              {/* Selected chips */}
              {form.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {form.tags.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TAG_OPTIONS.map((t) => {
                  const active = form.tags.includes(t.value);
                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => toggleTag(t.value)}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        active
                          ? "border-green-500 bg-green-500 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          {/* Allergens (previewed by ContainsFlags) */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">
                Allergens
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALLERGEN_OPTIONS.map((a) => {
                  const active = form.allergens.includes(a.value);
                  return (
                    <button
                      type="button"
                      key={a.value}
                      onClick={() => toggleAllergen(a.value)}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        active
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <ContainsFlags
              items={
                form.allergens.length
                  ? form.allergens
                  : ["Fish", "Dairy", "Soy", "Gluten"]
              }
            />
          </div>

          {/* Details: Includes / Options */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">
                Includes (one per line)
              </h4>
              <textarea
                name="includes"
                value={form.includes}
                onChange={handleChange}
                placeholder="×7 salmon entries (1 serving each)"
                className="h-32 w-full resize-none rounded-xl border border-black/20 bg-white/90 p-2 text-sm outline-none md:text-base"
              />
            </SectionCard>

            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">
                Options
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OPTION_CHOICES.map((opt) => {
                  const active = form.optionsSelected.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggleOption(opt.value)}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        active
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {form.optionsSelected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.optionsSelected.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => toggleOption(v)}
                        className="leading-none"
                        aria-label={`Remove ${v}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Preview lists */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailList title="Includes" lines={parseLines(form.includes)} />
            <DetailList title="Options" lines={form.optionsSelected} />
          </div>

          {/* Nutrition editor */}
          <div className="mt-4 grid grid-cols-1 gap-4">
            <SectionCard>
              <h4 className="mb-2 text-sm font-semibold md:text-base">
                Nutrition (per serving)
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center justify-between text-xs md:text-sm">
                    <span>Calories</span>
                    <input
                      type="number"
                      value={form.calories}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          calories: Math.max(0, parseInt(e.target.value || 0)),
                        }))
                      }
                      className="w-24 rounded-xl border border-black/20 bg-white/90 px-2 py-1 text-right"
                    />
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1500}
                    step={10}
                    value={form.calories}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        calories: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-black/70">
                    Calories auto-calc from macros (carbs×4 + protein×4 + fat×9).
                  </p>
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs md:text-sm">
                    <span>Carbs (g)</span>
                    <input
                      type="number"
                      value={form.carbs_g}
                    onChange={(e) =>
                      setMacro(
                        "carbs_g",
                        Math.max(0, parseFloat(e.target.value || 0))
                      )
                    }
                      className="w-24 rounded-xl border border-black/20 bg-white/90 px-2 py-1 text-right"
                    />
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={1}
                    value={form.carbs_g}
                    onChange={(e) => setMacro("carbs_g", parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs md:text-sm">
                    <span>Fat (g)</span>
                    <input
                      type="number"
                      value={form.fat_g}
                      onChange={(e) =>
                        setMacro(
                          "fat_g",
                          Math.max(0, parseFloat(e.target.value || 0))
                        )
                      }
                      className="w-24 rounded-xl border border-black/20 bg-white/90 px-2 py-1 text-right"
                    />
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={form.fat_g}
                    onChange={(e) => setMacro("fat_g", parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs md:text-sm">
                    <span>Protein (g)</span>
                    <input
                      type="number"
                      value={form.protein_g}
                      onChange={(e) =>
                        setMacro(
                          "protein_g",
                          Math.max(0, parseFloat(e.target.value || 0))
                        )
                      }
                      className="w-24 rounded-xl border border-black/20 bg-white/90 px-2 py-1 text-right"
                    />
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={1}
                    value={form.protein_g}
                    onChange={(e) => setMacro("protein_g", parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Derive calories from macros: 4/4/9 rule
                      const cals = Math.max(
                        0,
                        Math.round((Number(form.carbs_g) || 0) * 4 + (Number(form.protein_g) || 0) * 4 + (Number(form.fat_g) || 0) * 9)
                      );
                      setForm((p) => ({ ...p, calories: cals }));
                    }}
                    className="rounded-xl bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600"
                  >
                    Calculate calories from macros
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        calories: 0,
                        carbs_g: 0,
                        fat_g: 0,
                        protein_g: 0,
                      }))
                    }
                    className="rounded-xl bg-gray-200 px-3 py-2 hover:bg-gray-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </SectionCard>

            <NutritionChart
              title="Nutrition (per serving)"
              data={{
                calories: form.calories,
                carbs_g: form.carbs_g,
                fat_g: form.fat_g,
                protein_g: form.protein_g,
              }}
            />
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={form.submitting || missingLocation || missingZip}
            className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {form.submitting ? "Creating..." : "Create Meal"}
          </button>
        </div>

        {form.error && (
          <p className="mt-3 text-right text-sm text-rose-600">
            {String(form.error)}
          </p>
        )}
      </form>
    </main>
  );
}
