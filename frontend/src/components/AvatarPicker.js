import Button from "./Button";

const AVATARS = [
  "/avatar/chef1.png",
  "/avatar/chef2.png",
  "/avatar/chef3.png",
  "/avatar/chef4.png",
  "/avatar/chef5.png",
  "/avatar/chef6.png",
];

export default function AvatarPicker({
  name,
  value,
  onChange,
  options = AVATARS,
}) {
  const choose = (url) => onChange({ target: { name, value: url } });

  return (
    <div className="space-y-3 p-4 rounded-xl">
      <div className="grid grid-cols-3 gap-x-12 justify-items-center">
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
