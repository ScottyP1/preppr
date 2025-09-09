import SectionCard from "./SectionCard";

const DetailList = ({ title, lines = [] }) => (
  <SectionCard>
    <h4 className="mb-2 text-sm font-semibold md:text-base">{title}</h4>
    <ul className="space-y-1 text-sm md:text-base list-disc list-inside">
      {lines.map((l, i) => (
        <li key={`${title}-${i}`}>{l}</li>
      ))}
    </ul>
  </SectionCard>
);

export default DetailList;
