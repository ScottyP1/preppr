"use client";
import { useState } from "react";

import UserInputContainer from "@/components/UserInputContainer";

export default function Signup() {
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      if (!data.email) return setError("Please enter your email.");
      setStep(2);
    } else if (step === 2) {
      if (!data.code) return setError("Enter the 6-digit code.");
      setStep(3);
    } else if (step === 3) {
      if (data.password.length < 8)
        return setError("Password must be 8+ characters.");
      if (data.password !== data.confirmPassword)
        return setError("Passwords do not match.");
      console.log("SUBMIT:", data);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      {step === 1 && (
        /* Optional Values => (placeholder, linkText, href, buttonLabel, value, onChange, onClick, error) */
        <UserInputContainer
          name="email"
          type="email"
          title="Enter your Email"
          placeholder="you@email.com"
          linkText="Already have a account? Click Here."
          href="/login"
          buttonLabel="Continue"
          onChange={handleChange}
          value={data.email}
          onClick={handleNext}
          error={error}
        />
      )}
      {step === 2 && (
        <UserInputContainer
          name="code"
          type="number"
          title="Verify Email"
          subTitle="Please check your email for a 6-digit PIN"
          placeholder="123456"
          buttonLabel="Verify"
          onChange={handleChange}
          value={data.code}
          onClick={handleNext}
          error={error}
        />
      )}
      {step === 3 && (
        <UserInputContainer
          name="password"
          confirmName="confirmPassword"
          type="password"
          title="Create Password"
          placeholder="********"
          buttonLabel="Submit"
          onChange={handleChange}
          value={data.password}
          confirmValue={data.confirmPassword}
          onClick={handleNext}
          error={error}
        />
      )}
    </div>
  );
}
