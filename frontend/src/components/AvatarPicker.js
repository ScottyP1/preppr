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
  onSubmit,
}) {
  const choose = (url) => onChange({ target: { name, value: url } });

  return (
    <div className="space-y-3 bg-gray-500/[.5] p-4 rounded-xl">
      <h1 className="text-center text-2xl mb-12">Select an avatar</h1>
      <div className="grid grid-cols-3 gap-12 justify-items-center">
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
              className="w-20 h-20 object-cover"
            />
          </button>
        ))}
      </div>
      <Button className="p-4 rounded-xl w-full mt-12" onClick={onSubmit}>
        Submit
      </Button>
    </div>
  );
}
