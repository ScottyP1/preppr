"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Image from "next/image";

export default function MarketItem() {
  // grabs id from the params
  const params = useParams();
  const id = params.id;

  //   Todo:
  //    Set up useEffect to trigger on id change
  //    Should send api call to fetch more detail on specific item
  //    User can add item to cart, message chef for special request

  //   useEffect(() => {}, [id]);

  return (
    <div className="mx-12 text-black">
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* image */}
        <div className="w-full md:w-1/2">
          <div className="bg-black h-82 rounded-xl" />
        </div>

        {/* Cook profile */}
        <div className="w-full md:w-1/2 bg-gray-300 p-4 rounded-xl">
          <div className="flex gap-4 items-center">
            <div className="bg-black h-12 w-12 rounded-xl" />
            <h3>Cooks name (2,000+)</h3>
          </div>
        </div>
      </div>

      {/* List out warning containments */}
      <h1 className="text-center mt-2 text-xl">Contains the following:</h1>
      <div className="flex justify-center items-center mt-1 bg-red-400  rounded-md h-12">
        <span className="bg-black px-2 py-1 rounded-xl text-md text-white">
          Fish
        </span>
      </div>

      {/* List out complete order package details (Dummy Data) */}
      <div className="grid grid-cols-2 mt-6 gap-12">
        {/* Will create reusable component */}
        {/* Left column */}
        <div>
          <h2 className="text-2xl">Includes</h2>
          <div className="flex flex-col">
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>{" "}
          </div>
        </div>

        {/* Right column */}
        <div>
          <h2 className="text-2xl mb-2">Options</h2>
          <div className="flex flex-col gap-2 ml-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="option"
                value=""
                className="accent-black"
              />
              <span>Single meal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="option"
                value=""
                className="accent-black"
              />
              <span>7-Day meal prep</span>
            </label>
          </div>
        </div>

        {/* Left column  row-2 */}
        <div>
          <h2 className="text-2xl">Nutrition</h2>
          <div className="flex flex-col">
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>{" "}
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>{" "}
            <span className="ml-6 text-xs md:text-xl">
              x7 Salmon entries (1 serving each)
            </span>{" "}
          </div>
        </div>

        {/* Right column row-2 */}
        <div className="">
          <h2 className="text-2xl">Special Request</h2>
          <div className="flex flex-col">
            <textarea
              id="message"
              name="user_message"
              rows="3"
              placeholder="Enter your request here..."
              className="ml-6 bg-gray-200 rounded-lg p-2"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
