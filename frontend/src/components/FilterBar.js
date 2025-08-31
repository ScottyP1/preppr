import Button from "./Button";

// Match all inputs
const inputStyle =
  "h-10 px-3 bg-white text-black placeholder:text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40";

const CustomInput = ({
  name,
  value,
  placeholder,
  onChange,
  type = "text",
  className = "",
  inputMode,
}) => {
  return (
    <input
      type={type}
      name={name}
      className={`${inputStyle} ${className} sm:rounded-l-xl`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
    />
  );
};

const FilterBar = ({ inputs = [], handleChange, onClick }) => {
  return (
    <div className="w-full">
      <div
        className="
          flex flex-col sm:flex-row sm:flex-wrap justify-center
           sm:items-center mx-12 mt-4 gap-2 md:gap-0"
      >
        {inputs.map((item) => (
          <CustomInput
            key={item.name}
            name={item.name}
            value={item.value}
            placeholder={item.placeholder}
            onChange={handleChange}
            className="w-full sm:w-40"
            type={item.type}
            inputMode={item.type === "number" ? "numeric" : undefined}
          />
        ))}

        {/* Categories */}
        <select
          name="category"
          id="category"
          onChange={handleChange}
          className={`${inputStyle} w-full sm:w-40`}
          defaultValue=""
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

        {/* Radius */}
        <select
          name="radius"
          id="radius"
          onChange={handleChange}
          className={`${inputStyle} w-full sm:w-32`}
          defaultValue="10"
        >
          <option value="10">10 Miles</option>
          <option value="20">20 Miles</option>
          <option value="30">30 Miles</option>
          <option value="50">50 Miles</option>
        </select>

        <Button className="sm:rounded-r-xl sm:w-24" onClick={onClick}>
          Go
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
