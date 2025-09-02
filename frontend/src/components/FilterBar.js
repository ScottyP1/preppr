import Button from "./Button";

const inputStyle =
  "h-10 px-3 bg-white text-black placeholder:text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40";

const CustomInput = ({
  name,
  value,
  placeholder,
  onChange,
  className,
  type = "text",
}) => (
  <input
    type={type}
    name={name}
    className={`${inputStyle} w-full sm:w-40 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputMode={type === "number" ? "numeric" : undefined}
  />
);

export default function FilterBar({ inputs = [], handleChange, onClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center">
      {inputs.map((item) => (
        <CustomInput
          key={item.name}
          name={item.name}
          value={item.value}
          placeholder={item.placeholder}
          onChange={handleChange}
          type={item.type}
          className="md:rounded-l-xl"
        />
      ))}

      <select
        name="category"
        onChange={handleChange}
        defaultValue=""
        className={`${inputStyle} w-full sm:w-40`}
      >
        <option value="">All Categories</option>
        <option value="high-protein">High Protein</option>
        <option value="low-carb">Low Carb</option>
        <option value="vegan">Vegan</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="gluten-free">Gluten Free</option>
        <option value="dairy-free">Dairy Free</option>
        <option value="seafood">Seafood</option>
        <option value="bbq">BBQ</option>
      </select>

      <select
        name="radius"
        onChange={handleChange}
        defaultValue="10"
        className={`${inputStyle} w-full sm:w-32`}
      >
        <option value="10">10 Miles</option>
        <option value="20">20 Miles</option>
        <option value="30">30 Miles</option>
        <option value="50">50 Miles</option>
      </select>

      <Button className="sm:w-auto w-full md:rounded-r-xl" onClick={onClick}>
        Go
      </Button>
    </div>
  );
}
