import Link from "next/link";
import Button from "./Button";
import AvatarPicker from "./AvatarPicker";

const UserInputContainer = ({
  title,
  subTitle,
  inputs = [],
  linkText,
  href,
  buttonLabel,
  onClick,
  icon,
  errors,
}) => {
  return (
    <div className="flex flex-col justify-center items-center bg-white/40 p-12 md:p-6 rounded-lg gap-4 text-black md:min-w-[30rem]">
      {icon}
      <h1 className="text-2xl">{title}</h1>
      {subTitle && <h2>{subTitle}</h2>}

      {inputs.map((inp) => (
        <div key={inp.name} className="w-full">
          {inp.label && <h3 className="mb-1">{inp.label}</h3>}

          {inp.type === "avatar" ? (
            <AvatarPicker
              name={inp.name}
              value={inp.value}
              onChange={inp.onChange}
              options={inp.options || []}
            />
          ) : (
            <input
              name={inp.name}
              type={inp.type || "text"}
              onChange={inp.onChange}
              placeholder={inp.placeholder}
              className="bg-white rounded-lg p-2 w-full"
              value={inp.value}
              autoComplete={inp.autoComplete}
            />
          )}

          {errors?.[inp.name] && (
            <span className="text-red-500">{errors[inp.name]}</span>
          )}
        </div>
      ))}

      {errors?.detail && (
        <span className="text-red-500 text-sm">{errors.detail}</span>
      )}

      <Button className="w-full" onClick={onClick}>
        {buttonLabel}
      </Button>

      {linkText && href && <Link href={href}>{linkText}</Link>}
    </div>
  );
};

export default UserInputContainer;
