"use client";

import { useState, useRef } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Chef");
  const [message, setMessage] = useState("");

  // Variable to hold last submitted JSON
  const lastSubmissionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const submission = {
      name: name.trim(),
      email: email.trim(),
      role,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    // store in the page variable (ref) for temporary use and console.log
    lastSubmissionRef.current = submission;
    console.log("Contact submission:", submission);

    // clear inputs
    setName("");
    setEmail("");
    setRole("Customer");
    setMessage("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        className="w-[420px] h-[600px] rounded-2xl bg-white/40 backdrop-blur-md shadow-lg flex flex-col items-center p-6"
        role="region"
        aria-labelledby="contact-preppr-title"
      >
        <div className="flex-shrink-0 w-80 h-24 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src="/Preppr_smaller.png"
            alt="Preppr logo"
            className="w-100 h-auto object-contain"
          />
        </div>

        <h1
          id="contact-preppr-title"
          className="mt-4 text-2xl font-semibold text-[#556452]"
        >
          Contact Preppr
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-4 w-full flex-1 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <label className="block text-sm text-[#556452]">
              <span className="block text-xs text-[#556452]">Name:</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md bg-white text-[#556452] placeholder:text-[#556452]/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your name"
                required
              />
            </label>

            <label className="block text-sm text-[#556452]">
              <span className="block text-xs text-[#556452]">Email:</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md bg-white text-[#556452] placeholder:text-[#556452]/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@example.com"
                required
              />
            </label>

            <fieldset className="text-sm text-[#556452]">
              <legend className="block text-xs text-[#556452]">Preppr Role:</legend>
              <div className="mt-1 flex items-center gap-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="Chef"
                    checked={role === "Chef"}
                    onChange={() => setRole("Chef")}
                    className="form-radio text-indigo-400 w-4 h-4"
                  />
                  <span className="ml-2 text-[#556452]">Chef</span>
                </label>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="Customer"
                    checked={role === "Customer"}
                    onChange={() => setRole("Customer")}
                    className="form-radio text-indigo-400 w-4 h-4"
                  />
                  <span className="ml-2 text-[#556452]">Customer</span>
                </label>
              </div>
            </fieldset>

            <label className="block text-sm text-[#556452]">
              <span className="block text-xs text-[#556452]">Message:</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-md bg-white text-[#556452] placeholder:text-[#556452]/50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Write your message..."
                required
              />
            </label>
          </div>

          <div className="w-full mt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md  bg-[#82FF82] text-black hover:bg-[#76E7A4] px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
