"use client";

import { useSession } from "next-auth/react";
import { LogoutButton } from "../components/auth";
import Loader from "../components/Loader";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Show loading spinner while fetching session data
  if (status === "loading") return <Loader />;

  if (status !== "authenticated") {
    redirect("/");
  }

  const { user } = session;

  return (
    <div className="h-[100vh]">
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* User basic information */}
      <div className="p-4 border rounded-lg shadow mb-4">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* User points */}
      <div className="p-4 border rounded-lg shadow mb-4">
        <p>
          <strong>Points:</strong> 💰 {user.points ?? 0}
        </p>
      </div>

      {/* User badges */}
      <div className="p-4 border rounded-lg shadow mb-4">
        <p className="font-semibold">Earned Badges</p>
        <ul>
          <p>No badges earned yet.</p>
        </ul>
      </div>

      <div className="flex justify-between">
        {/* Navigate to settings page */}
        <a
          href="/profile"
          className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600"
        >
          Go to Settings Page (not implemented)
        </a>
        <LogoutButton />
      </div>
    </div>
    </div>
  );
}
