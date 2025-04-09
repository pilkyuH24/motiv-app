"use client";

import { signIn, signOut } from 'next-auth/react';
import './logInOutBtn.css';

export const LoginButton = () => {
  return (
    <div className="wrapper">
      <button onClick={() => signIn()} className="holo-btn">Sign In</button>
    </div>
  );
};

export const LogoutButton = () => {
  return (
      <button onClick={() => signOut({ callbackUrl: "/" }) } className="bg-indigo-800/60 text-base text-white rounded-lg px-5 py-2 shadow transition-colors hover:bg-indigo-800/90">Sign Out</button>
  );
};
