"use client";

import { useState } from "react";

import UserInputContainer from "@/components/UserInputContainer";
import { HiOutlineMail } from "react-icons/hi";
import { login } from "@/api/authRoutes";

export default function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await login(data);
    } catch (err) {
      setErrors(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <UserInputContainer
        inputs={[
          {
            label: "Email",
            name: "username",
            type: "text",
            placeholder: "you@email.com",
            value: data.username,
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
        title="Login"
        placeholder="you@email.com"
        linkText="Dont have a account? Click Here."
        href="/signup"
        buttonLabel="Login"
        onChange={handleChange}
        value={data.email}
        errors={errors}
        icon={<HiOutlineMail size={100} />}
        onClick={handleSubmit}
      />
    </div>
  );
}
