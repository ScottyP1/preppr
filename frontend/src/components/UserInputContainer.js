import { useEffect, useState } from "react";
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
  icon,
  handleResend,
}) => {
  const [counter, setCounter] = useState(30);

  // Counter for resending code, limits user from spamming
  useEffect(() => {
    if (!handleResend) return;
    const timer = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Once user clicks resend code well call function and reset counter
  const handleReset = () => {
    handleResend;
    setCounter(30);
  };

  return (
    <div className="flex flex-col justify-center items-center bg-[#D9D9D9]/[.8] p-6 rounded-lg gap-4 text-black md:min-w-xl">
      {icon}

      {/* Container Title */}
      <h1>{title}</h1>

      {/* Optional Subtitle */}
      {subTitle && <h2>{subTitle}</h2>}

      {/* If not password / Renders single input */}
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

      {/* Hanlde resending code to email */}
      {handleResend &&
        (counter > 0 ? (
          <span className="text-gray-500 cursor-not-allowed">
            Didn’t get the code? You can resend in {counter}s.
          </span>
        ) : (
          <span onClick={handleReset} className="text-white cursor-pointer">
            Didn’t get the code? Click here to resend.
          </span>
        ))}

      {/* If password type create two inputs (password, confirmPassword) */}
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

      {/* If any errors will display when user tries to continue */}
      {error && <span className="text-red-500">{error}</span>}

      <Button className="w-full" onClick={onClick}>
        {buttonLabel}
      </Button>

      {/* Option to redirect to login/register */}
      {linkText && href && <Link href={href}>{linkText}</Link>}
    </div>
  );
};

export default UserInputContainer;
