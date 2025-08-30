import Button from "./Button";

// Match all inputs
const inputStyle =
  "h-10 px-3 rounded-xl bg-white text-black placeholder:text-black border border-gray-300";

const CustomInput = ({
  name,
  value,
  placeholder,
  onChange,
  type,
  className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      className={`${inputStyle} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

const FilterBar = ({ inputs = [], handleChange, onClick }) => {
  return (
    <div className="bg-gray-500 rounded-lg p-2 max-w-xl mx-auto">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {inputs.map((item) => (
          <CustomInput
            key={item.name}
            name={item.name}
            value={item.value}
            placeholder={item.placeholder}
            onChange={handleChange}
            className=""
            type={item.type}
          />
        ))}

        {/* Categories */}
        <select
          name="category"
          id="category"
          onChange={handleChange}
          className={`${inputStyle} w-40`}
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
          className={`${inputStyle}`}
        >
          <option value="10">10 Miles</option>
          <option value="20">20 Miles</option>
          <option value="30">30 Miles</option>
          <option value="50">50 Miles</option>
        </select>

        <Button className="h-10 px-4 rounded-xl" onClick={onClick}>
          Go
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
