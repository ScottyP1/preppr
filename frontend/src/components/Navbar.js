"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile hamburger
  const [menuOpen, setMenuOpen] = useState(false); // user menu dropdown
  const { user, logout } = useContext(AuthContext) || {};
  const router = useRouter();
  const [imgError, setImgError] = useState(false); // track if avatar failed to load

  useEffect(() => {
    if (open) setMenuOpen(false);
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleMobileLogout = () => {
    logout?.();
    router.push("/login");
  };

  const DesktopNavLink = ({ href, children }) => (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 hover:text-black"
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }) => (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black"
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-black/[.4] relative">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Left section: hamburger + logo + nav links */}
          <div className="flex items-center">
            {/* Hamburger now on the far left */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="mr-2 inline-flex items-center justify-center p-2 rounded-md md:hidden focus:outline-none"
            >
              {open ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Logo goes to /market if logged in, / if not */}
            <Link
              href={user ? "/market" : "/"}
              className="flex items-center gap-3"
            >
              <Image
                src={
                  user?.user?.role === "seller"
                    ? "/preppr.png"
                    : "/Preppr_smaller.png"
                }
                alt="Preppr Logo"
                width={210}
                height={40}
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex md:ml-6 md:space-x-2">
              {user ? (
                <DesktopNavLink href="/market">Market</DesktopNavLink>
              ) : (
                <DesktopNavLink href="/">Home</DesktopNavLink>
              )}
              <DesktopNavLink href="/about">About</DesktopNavLink>
              <DesktopNavLink href="/contact">Contact</DesktopNavLink>
            </div>
          </div>

          {/* Right section: login/avatars */}
          <div className="flex items-center gap-2">
            {!user && (
              <div className="hidden md:block">
                <Link
                  href="/login"
                  className="px-4 py-2 border border-white text-white rounded-md text-sm font-medium hover:bg-indigo-50 hover:text-black"
                >
                  Login
                </Link>
              </div>
            )}

            {user && (
              <div className="relative inline-block">
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-black text-sm font-medium focus:outline-none hover:ring-2 hover:ring-white transition"
                  title="Open account menu"
                >
                  {user?.user?.avatar ? (
                    <Image
                      src={user?.user?.avatar}
                      alt={`${user?.username || "User"} avatar`}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span aria-hidden className="text-lg">
                      👤
                    </span>
                  )}
                </button>

                {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden mt-2 pb-4">
            <div className="space-y-1 px-2">
              {!user ? (
                <MobileNavLink href="/">Home</MobileNavLink>
              ) : (
                <MobileNavLink href="/market">Market</MobileNavLink>
              )}
              <MobileNavLink href="/about">About</MobileNavLink>
              <MobileNavLink href="/contact">Contact</MobileNavLink>

              {!user ? (
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium border border-white text-white hover:bg-indigo-50 hover:text-black"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleMobileLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-black"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
