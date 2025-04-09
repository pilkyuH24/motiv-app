// Profile Page
"use client";

import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/ui/logInOutBtn";
import Navbar from "@/components/layout/navbar";
import Loader from "@/components/ui/Loader";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge, ProfileSectionProps, BadgesListProps } from "@/types/profile";

// Section component for profile layout
const ProfileSection = ({ title, children }: ProfileSectionProps) => (
  <div className="p-4 bg-white/40 rounded-lg shadow mb-4 text-xl">
    {title && <h2 className="font-semibold mb-2">{title}</h2>}
    {children}
  </div>
);

// Badges list component
const BadgesList = ({ badges = [], isLoading = false }: BadgesListProps) => (
  <ProfileSection title="Earned Badges">
    {isLoading ? (
      <p>Loading badges...</p>
    ) : badges.length > 0 ? (
      <ul className="space-y-2">
        {badges.map((badge, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-2xl">🏆</span>
            <div>
              <p className="font-medium">{badge.title}</p>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>No badges earned yet.</p>
    )}
  </ProfileSection>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? All your data will be permanently removed."
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("An error occurred while deleting your account.");
      }

      alert("Your account has been successfully deleted.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting your account."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch badges for the authenticated user
  useEffect(() => {
    const fetchBadges = async () => {
      if (status === "authenticated") {
        setIsLoadingBadges(true);
        try {
          const response = await fetch("/api/user/badges");
          if (!response.ok) {
            throw new Error("Failed to fetch badges.");
          }
          const data = await response.json();
          setBadges(data);
        } catch (error) {
          console.error("Failed to fetch badges:", error);
        } finally {
          setIsLoadingBadges(false);
        }
      }
    };

    fetchBadges();
  }, [status]);

  if (status === "loading") return <Loader />;
  if (status !== "authenticated") {
    redirect("/");
  }

  const { user } = session;

  return (
    <div className="h-[100vh]">
      <Navbar />
      <div className="mt-16 p-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Profile</h1>

        {/* Basic user info */}
        <ProfileSection>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </ProfileSection>

        {/* Earned badges */}
        <BadgesList badges={badges} isLoading={isLoadingBadges} />

        <div className="flex justify-between">
          {/* Delete account */}
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className={`mt-4 inline-block py-2 px-4 rounded-lg shadow ${
              isDeleting ? "bg-gray-400" : "bg-red-500/80 hover:bg-red-600"
            } text-white`}
          >
            {isDeleting ? "Processing..." : "Delete Account"}
          </button>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
