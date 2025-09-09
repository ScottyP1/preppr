import SectionCard from "./SectionCard";

const SpecialRequest = () => (
  <SectionCard className="mt-4">
    <label htmlFor="special" className="mb-2 block text-sm font-semibold">
      Special Requests
    </label>
    <div className="flex flex-col gap-3 md:flex-row">
      <input
        id="special"
        type="text"
        placeholder="No asparagus"
        className="w-full rounded-xl border border-black/20 bg-white/90 px-3 py-2 outline-none"
      />
      <button
        type="button"
        className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white transition hover:opacity-90 md:shrink-0"
      >
        Request
      </button>
    </div>
  </SectionCard>
);

export default SpecialRequest;
