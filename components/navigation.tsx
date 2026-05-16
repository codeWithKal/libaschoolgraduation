"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Students", href: "/students" },
    { label: "Teachers", href: "/teachers" },
    { label: "Memories", href: "/memories" },
    { label: "Shared Gallery", href: "/shared-gallery" },
    { label: "Guestbook", href: "/guestbook" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-yellow-500/20 bg-black/70 backdrop-blur-xl shadow-[0_0_25px_rgba(250,204,21,0.08)]">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              {/* Graduation cap */}
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              <path d="M5 12.5V16c0 1.66 3.58 3 8 3s8-1.34 8-3v-3.5l-8 4.36-8-4.36z" />
            </svg>
          </div>

          <span
            style={{ fontFamily: "var(--font-elegant)" }}
            className="text-2xl md:text-3xl font-semibold tracking-[0.2em] uppercase text-yellow-400 
             group-hover:text-yellow-300 transition duration-300
             drop-shadow-[0_0_10px_rgba(250,204,21,0.25)]"
          >
            NOVAREING
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNew = item.label === "Shared Gallery";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? "text-yellow-400 bg-yellow-500/10 border border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                    : "text-gray-300 hover:text-yellow-300 hover:bg-white/5"
                }`}
              >
                {item.label}

                {/* ✨ NEW BADGE */}
                {isNew && (
                  <span className="relative flex items-center">
                    <span className="relative px-2 py-[2px] text-[10px] font-bold text-black bg-yellow-400 rounded-full">
                      NEW
                    </span>

                    {/* glowing pulse */}
                    <span className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-60 animate-ping" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-500/20 bg-black/95 backdrop-blur-xl">
          <div className="px-4 py-5 flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isNew = item.label === "Shared Gallery";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-between ${
                    isActive
                      ? "text-yellow-400 bg-yellow-500/10 border border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                      : "text-gray-300 hover:text-yellow-300 hover:bg-white/5"
                  }`}
                >
                  <span>{item.label}</span>

                  {/* ✨ NEW BADGE MOBILE */}
                  {isNew && (
                    <span className="relative">
                      <span className="px-2 py-[2px] text-[10px] font-bold text-black bg-yellow-400 rounded-full">
                        NEW
                      </span>
                      <span className="absolute inset-0 bg-yellow-400 blur-md opacity-50 animate-ping rounded-full" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
