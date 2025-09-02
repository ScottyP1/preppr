"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";

import UserInputContainer from "@/components/UserInputContainer";

import { HiOutlineMail } from "react-icons/hi";

import { AuthContext } from "@/context/AuthContext";

export default function Signup() {
  const { signUp } = useContext(AuthContext);
  const [data, setData] = useState({
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (data.password !== data.password_confirm) {
      setErrors("Passwords must match");
      return;
    }

    try {
      await signUp(data);
      router.push("/login");
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
            value: data.password,
            onChange: handleChange,
          },
          {
            label: "Confirm Password",
            name: "password_confirm",
            type: "password",
            placeholder: "*********",
            value: data.password_confirm,
            onChange: handleChange,
          },
        ]}
        title="Signup"
        linkText="Already have a account? Click Here."
        href="/login"
        buttonLabel="Submit"
        onClick={handleSubmit}
        errors={errors}
        icon={<HiOutlineMail size={100} />}
      />
    </div>
  );
}
