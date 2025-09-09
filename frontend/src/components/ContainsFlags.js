import SectionCard from "./SectionCard";

const ContainsFlags = ({ items = ["Fish", "Dairy", "Soy", "Gluten"] }) => (
  <SectionCard>
    <h1 className="mb-2 text-center font-bold">Contains</h1>
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map((flag) => (
        <span
          key={flag}
          className="rounded-full border border-black/30 px-4 py-1 text-sm bg-white/70"
        >
          {flag}
        </span>
      ))}
    </div>
  </SectionCard>
);

export default ContainsFlags;
