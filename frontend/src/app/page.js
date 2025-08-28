import Image from "next/image";
import Link from "next/link";

import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="text-black">
      <div className="max-w-8xl mx-auto mt-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center items-center">
          <Image
            alt="Cooking"
            src="/cooking1.png"
            width={500}
            height={400}
            className="mt-4"
          />

          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-3xl">
              The End Of Corporate Meal Kits Starts Here
            </h1>
            <span>
              Preppr empowers local chefs and home cooks to feed their
              neighborhoods with love, not mass production
            </span>
            <Link
              href="/signup"
              className="w-full text-xl font-bold p-4 bg-[#82FF82] hover:bg-[#76E7A4] text-black rounded-full"
            >
              Join Preppr
            </Link>
            <Link href="login">
              Already have an account? Click Here to Login
            </Link>
          </div>

          <Image
            alt="Cooking"
            src="/cooking5.png"
            width={550}
            height={400}
            className="hidden md:block"
          />
          <Image
            alt="Cooking"
            src="/cooking2.png"
            width={400}
            height={400}
            className="hidden md:block"
          />
          <Image
            alt="Cooking"
            src="/cooking3.png"
            width={550}
            height={400}
            className="hidden md:block"
          />
          <Image
            alt="Cooking"
            src="/cooking4.png"
            width={400}
            height={400}
            className="hidden md:block"
          />
        </div>
      </div>

      <section id="how" className="mx-auto max-w-8xl px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            title="Cooked Near You"
            desc="Meals prepared by neighbors, pop-ups, and local pros—never a factory."
          />
          <Feature
            title="Transparent Menus"
            desc="Ingredients, allergens, and chef bios—know exactly who and what you’re supporting."
          />
          <Feature
            title="Flexible Ordering"
            desc="One-offs, weekly prep, or small events. No subscriptions or traps."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl p-5 bg-white/30 backdrop-blur">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-black/70">{desc}</p>
    </div>
  );
}
