"use client";

import { signIn, signOut } from "next-auth/react";
import "./auth.css";

export const LoginButton = () => {
  return (
    <div className="wrapper">
      <button onClick={() => signIn()} className="holo-btn">Sign In</button>
    </div>
  );
};

export const LogoutButton = () => {
  return (
      <button onClick={() => signOut() } className="bg-gray-500/50 text-base text-white rounded-lg px-5 py-2 shadow transition-colors hover:bg-gray-800/80">Sign Out</button>
  );
};
