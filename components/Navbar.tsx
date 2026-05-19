"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  return (

    <nav className="bg-black text-white px-8 py-5 flex items-center justify-between">

      {/* WEBSITE LOGO / NAME */}

      <Link
        href="/"
        className="text-2xl font-bold hover:text-gray-300 transition"
      >
        Trapped Into Architecture
      </Link>

      {/* MENU */}

      <div className="flex items-center gap-8 text-lg">

        {/* HOME */}

        <Link
          href="/"
          className="hover:text-gray-300 transition"
        >
          Home
        </Link>

        {/* JOBS */}

        <Link
          href="/jobs"
          className="hover:text-gray-300 transition"
        >
          Jobs
        </Link>

        {/* PROFILE DROPDOWN */}

        <div className="relative">

          <button
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
            className="flex items-center gap-2 hover:text-gray-300 transition"
          >

            Profile

            <span className="text-sm">
              ▼
            </span>

          </button>

          {/* DROPDOWN */}

          {showProfileMenu && (

            <div className="absolute top-12 right-0 bg-white text-black rounded-2xl shadow-lg border w-52 overflow-hidden z-50">

              <Link
                href="/companies"
                className="block px-5 py-4 hover:bg-gray-100 transition"
              >
                Companies
              </Link>

              <Link
                href="/individuals"
                className="block px-5 py-4 hover:bg-gray-100 transition"
              >
                Individuals
              </Link>

            </div>

          )}

        </div>

        {/* PRACTICE EXAMS */}

        <Link
          href="/practice-exams"
          className="hover:text-gray-300 transition"
        >
          Practice Exams
        </Link>

        {/* CONTACT */}

        <Link
          href="/contact"
          className="hover:text-gray-300 transition"
        >
          Contact
        </Link>

      </div>

    </nav>

  );

}