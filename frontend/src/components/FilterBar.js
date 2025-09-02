const FilterBar = ({ value, placeholder, onChange }) => {
  return (
    <div className="bg-gray-500 rounded-lg p-2 max-w-1/2 mx-auto">
      <div className="flex gap-4 items-center justify-evenly">
        {/* Zip */}
        <CustomInput
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        {/* Cusine */}
        <CustomInput
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        {/* Radius */}
        <CustomInput
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default FilterBar;

const CustomInput = ({ value, placeholder, onChange }) => {
  return (
    <input
      className="bg-white p-2 rounded-xl"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
