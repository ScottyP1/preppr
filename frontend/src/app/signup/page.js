"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

import UserInputContainer from "@/components/UserInputContainer";

import { HiOutlineMail, HiOutlineMailOpen } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";

import { signUp } from "@/api/authRoutes";

export default function Signup() {
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    // code: "",
  });

  const [error, setError] = useState("");
  // const [step, setStep] = useState(1);
  const router = useRouter();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  //   api/register_user
  //   const handleNext = async () => {
  //     setError(null);
  // if (step === 1) {
  //   if (!data.email) return setError("Please enter your email.");
  //   setStep(2);
  // } else if (step === 2) {
  //   if (!data.code) return setError("Enter the 6-digit code.");
  //   setStep(3);
  // } else if (step === 3) {
  //   if (data.password.length < 8)
  //     return setError("Password must be 8+ characters.");
  //   if (data.password !== data.confirmPassword)
  //     return setError("Passwords do not match.");
  //   console.log("SUBMIT:", data);
  // }
  //   };

  //   const handleResend = () => {
  //     console.log("resend tried");
  //   };

  const handleSubmit = async () => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords Must Match");
      return;
    }

    try {
      const res = await signUp(data);
      console.log("Registered:", res);
      router.push("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.data);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <UserInputContainer
        inputs={[
          {
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "you@gmail.com",
            value: data.email,
            onChange: handleChange,
          },
          {
            label: "Password",
            name: "password",
            type: "password",
            placeholder: "*********",
            value: data.email,
            onChange: handleChange,
          },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            type: "password",
            placeholder: "*********",
            value: data.email,
            onChange: handleChange,
          },
        ]}
        title="Enter your Email"
        linkText="Already have a account? Click Here."
        href="/login"
        buttonLabel="Submit"
        onClick={handleSubmit}
        error={error}
        icon={<HiOutlineMail size={100} />}
      />
      {/* {step === 1 && (
        <UserInputContainer
          inputs={[
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "you@gmail.com",
              value: data.email,
              onChange: handleChange,
            },
          ]}
          title="Enter your Email"
          linkText="Already have a account? Click Here."
          href="/login"
          buttonLabel="Continue"
          onClick={handleNext}
          error={error}
          icon={<HiOutlineMail size={100} />}
        />
      )}
      {step === 2 && (
        <UserInputContainer
          inputs={[
            {
              label: "",
              name: "code",
              type: "number",
              placeholder: "123456",
              value: data.code,
              onChange: handleChange,
            },
          ]}
          title="Verify Email"
          subTitle="Please check your email for a 6-digit PIN"
          buttonLabel="Verify"
          onClick={handleNext}
          error={error}
          icon={<HiOutlineMailOpen size={100} />}
          handleResend={handleResend}
        />
      )}
      {step === 3 && (
        <UserInputContainer
          inputs={[
            {
              label: "Password",
              name: "password",
              type: "password",
              placeholder: "****************",
              value: data.password,
              onChange: handleChange,
            },
            {
              label: "Confirm Password",
              name: "confirmPassword",
              type: "password",
              placeholder: "****************",
              value: data.confirmPassword,
              onChange: handleChange,
            },
          ]}
          title="Create Password"
          buttonLabel="Submit"
          onClick={handleNext}
          error={error}
          icon={<RiLockPasswordFill size={100} />}
        />
      )} */}
    </div>
  );
}
