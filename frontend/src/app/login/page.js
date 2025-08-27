"use client";

import { useState } from "react";

import UserInputContainer from "@/components/UserInputContainer";
import { HiOutlineMail } from "react-icons/hi";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <UserInputContainer
        inputs={[
          {
            label: "Email",
            name: "email",
            type: "text",
            placeholder: "you@email.com",
            value: data.email,
            onChange: handleChange,
          },
          {
            label: "Password",
            name: "password",
            type: "password",
            placeholder: "****************",
            value: data.password,
            onChange: handleChange,
          },
        ]}
        title="Enter your Email"
        placeholder="you@email.com"
        linkText="Dont have a account? Click Here."
        href="/signup"
        buttonLabel="Continue"
        onChange={handleChange}
        value={data.email}
        error={error}
        icon={<HiOutlineMail size={100} />}
        onClick={handleSubmit}
      />
    </div>
  );
}
