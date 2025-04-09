"use client";

import Link from "next/link";
import React from "react";
import { LoginButton } from "@/components/ui/logInOutBtn";
import { useSession } from "next-auth/react";
import "./navbar.css";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="top-0 w-full bg-gradient-to-br from-yellow-300/20 to-orange-200/20 backdrop-blur-xl shadow-sm text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo(text) */}
        <div className="text-xl ml-2 sm:text-3xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]">Motivation App</div>

        {/* Sign In/Out and Links */}
        <div className="flex-1 flex justify-end gap-6 items-center text-base sm:text-xl ">
          {!session ? (
            <LoginButton />
          ) : (
            <>
              <Link href="/missions" className="hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.3)]">
                Missions
              </Link>
              <Link href="/profile" className="hover:underline drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.3)]">
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
