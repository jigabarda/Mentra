"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/interview", label: "Interview Coach" },
    { href: "/interview/history", label: "Interview History" },
    { href: "/login", label: "Login" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); // Trigger when user scrolls down
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0a0f24]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-4 text-white">
        {/* Brand Icon + Name */}
        <div className="flex items-center gap-2">
          {/* Placeholder for Mentra icon (replace with actual icon when ready) */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-400"
          >
            <circle
              cx="14"
              cy="14"
              r="13"
              stroke="#3B82F6"
              strokeWidth="2"
              fill="#0a0f24"
            />
            <rect
              x="8"
              y="10"
              width="12"
              height="8"
              rx="2"
              fill="#fff"
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
            <rect x="12" y="7" width="4" height="6" rx="1.5" fill="#3B82F6" />
          </svg>
          <h1 className="text-lg font-bold tracking-wide font-sans">
            Men<span className="text-blue-800">tra</span>
          </h1>
        </div>
        <ul className="flex space-x-6">
          {links.map(({ href, label }) => (
            <li key={href} className="relative group">
              <Link
                href={href}
                className={`relative font-sans transition duration-500 z-10 ${
                  pathname === href ? "text-white" : "hover:text-white"
                }`}
              >
                <span className="relative z-10">{label}</span>
                {/* Animated underline for active or hover */}
                <span
                  className={`absolute left-1/2 -bottom-1.5 -translate-x-1/2 h-0.5 rounded-full bg-blue-400 transition-all duration-500
                    ${
                      pathname === href
                        ? "w-8 opacity-100 animate-underline"
                        : "w-0 group-hover:w-8 group-hover:opacity-100 opacity-0"
                    }
                  `}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
