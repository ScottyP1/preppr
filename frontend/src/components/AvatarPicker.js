// components/AvatarPicker.jsx
export default function AvatarPicker({ name, value, onChange, options = [] }) {
  const choose = (url) => onChange({ target: { name, value: url } });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {options.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => choose(url)}
            className={`rounded-full p-2 overflow-hidden ring-2 ${
              value === url ? "ring-blue-500" : "ring-transparent"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            aria-pressed={value === url}
          >
            {/* next/image is fine too if you have the host configured */}
            <img
              src={url}
              alt="Avatar option"
              className="w-12 h-12 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
