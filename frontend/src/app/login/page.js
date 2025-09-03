"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/context/AuthContext";
import UserInputContainer from "@/components/UserInputContainer";
import { HiOutlineMail } from "react-icons/hi";
import AvatarPicker from "@/components/AvatarPicker";

export default function Login() {
  const { login, user, update } = useContext(AuthContext);
  const [data, setData] = useState({ username: "", password: "", avatar: "" });
  const [step, setStep] = useState(1);

  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!data.avatar?.trim()) {
        setErrors({ avatar: ["Please choose an avatar"] });
        return;
      }
      await update({ avatar: data.avatar });
      router.push("/market");
    } catch (err) {
      setErrors(err);
    }
  };

  const handleNext = async () => {
    try {
      await login(data);
      if (!user?.avatar) return setStep(2);
      router.push("/market");
    } catch (err) {
      setErrors(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      {step === 1 && (
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
          errors={errors}
          icon={<HiOutlineMail size={100} />}
          onClick={handleNext}
        />
      )}

      {step === 2 && (
        <>
          <AvatarPicker
            name="avatar"
            value={data.avatar}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
