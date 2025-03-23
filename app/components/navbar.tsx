"use client";

import Link from "next/link";
import React from "react";
import { LoginButton } from "./auth";
import { useSession } from "next-auth/react";
import "./auth.css";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="top-0 w-full bg-gradient-to-br from-orange-200 to-pink-200 p-2 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo(text) */}
        <div className="text-xl ml-2 sm:text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Motivation App</div>

        {/* Sign In/Out and Links */}
        <div className="flex-1 flex justify-end gap-6 items-center text-base sm:text-xl ">
          {!session ? (
            <LoginButton />
          ) : (
            <>
              <Link href="/missions" className="hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.15)]">
                Missions
              </Link>
              <Link href="/profile" className="hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.15)]">
                Profile
              </Link>
              <div className="wrapper">
                <Link href="/dashboard" className="holo-btn">
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
