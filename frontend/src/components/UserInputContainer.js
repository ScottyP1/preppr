import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "./Button";

const UserInputContainer = ({
  title,
  subTitle,
  inputs = [],
  linkText,
  href,
  buttonLabel,
  onClick,
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
  }, [handleResend]);

  const handleReset = async () => {
    handleResend;
    setCounter(resendSeconds);
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white/40 p-6 rounded-lg gap-4 text-black md:min-w-[28rem]">
      {icon}

      {/* Container Title */}
      <h1>{title}</h1>
      {subTitle && <h2>{subTitle}</h2>}

      {/* Render any passed inputs */}
      {inputs.map((inp) => (
        <div key={inp.name} className="w-full">
          {inp.label && <h3 className="self-start mb-1">{inp.label}</h3>}
          <input
            name={inp.name}
            type={inp.type || "text"}
            onChange={inp.onChange}
            placeholder={inp.placeholder}
            className="bg-white rounded-lg p-2 w-full"
            value={inp.values}
          />
        </div>
      ))}

      {/* Handle resending code to email */}
      {handleResend &&
        (counter > 0 ? (
          <span className="text-gray-500 cursor-not-allowed">
            Didn’t get the code? You can resend in {counter}s.
          </span>
        ) : (
          <span onClick={handleReset} className="text-blue-600 cursor-pointer">
            Didn’t get the code? Click here to resend.
          </span>
        ))}

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
