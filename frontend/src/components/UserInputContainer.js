import Link from "next/link";
import Button from "./Button";

const UserInputContainer = ({
  title,
  subTitle,
  type,
  placeholder,
  linkText,
  href,
  buttonLabel,
  onChange,
  value,
  onClick,
  name,
  confirmValue,
  confirmName,
  error,
}) => {
  return (
    <div className="flex flex-col justify-center items-center bg-[#D9D9D9] p-6 rounded-lg gap-4 text-black md:min-w-xl">
      <div className="h-12 w-12 bg-gray-400 rounded-full" />
      <h1>{title}</h1>
      {subTitle && <h2>{subTitle}</h2>}
      {type !== "password" && (
        <input
          name={name}
          type={type}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-white rounded-lg p-2 w-full"
          value={value}
        />
      )}

      {type === "password" && (
        <>
          <h3 className="self-start">Password</h3>
          <input
            name={name}
            type={type}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-white rounded-lg p-2 w-full"
            value={value}
          />
          <h3 className="self-start">Confirm Password</h3>
          <input
            name={confirmName}
            type={type}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-white rounded-lg p-2 w-full"
            value={confirmValue}
          />
        </>
      )}
      {error && <span className="text-red-500">{error}</span>}
      <Button className="w-full" onClick={onClick}>
        {buttonLabel}
      </Button>
      {linkText && href && <Link href={href}>{linkText}</Link>}
    </div>
  );
};

export default UserInputContainer;
