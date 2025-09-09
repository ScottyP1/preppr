const SectionCard = ({ className = "", children }) => (
  <section
    className={`rounded-2xl bg-gray-300/80 p-3 md:p-4 mt-4 ${className}`}
  >
    {children}
  </section>
);

export default SectionCard;
