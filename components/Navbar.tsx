"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/interview", label: "Interview Coach" },
  ];

  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-md">
      <h1 className="text-lg font-bold tracking-wide">Mentra</h1>
      <ul className="flex space-x-6">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`hover:text-blue-400 transition ${
                pathname === href ? "text-blue-400 font-semibold" : ""
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
