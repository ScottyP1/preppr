"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-500">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Preppr_smaller.png" alt="Preppr Logo" width={210} height={40} />
            </Link>

            {/* nav links */}
            <div className="hidden md:flex md:ml-6 md:space-x-2">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100  hover:text-black">Home</Link>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100  hover:text-black">About</Link>
              <Link href="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 hover:text-black">Contact</Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:block">
              <Link
                href="/login"
                className="px-4 py-2 border border-white text-white rounded-md text-sm font-medium hover:bg-indigo-50  hover:text-black"
              >
                Login
              </Link>
            </div>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md md:hidden focus:outline-none"
            >
              {open ? (
                /* Close icon */
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Hamburger Menu */}
        {open && (
          <div className="md:hidden mt-2 pb-4">
            <div className="space-y-1 px-2">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100  hover:text-black">Home</Link>
              <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black">About</Link>
              <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black">Contact</Link>
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium border border-white text-white hover:bg-indigo-50 hover:text-black">Login</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
