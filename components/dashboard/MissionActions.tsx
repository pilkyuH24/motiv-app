//components/dashboard/MissionAction.tsx
"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import BadgeModal from "./BadgeModal";

// Define badge interface
interface Badge {
  id: number;
  title: string;
  description: string | null;
  rank?: number;
}

// Interface for the badge from API response
interface BadgeResponse {
  id: number;
  title: string;
  description: string | null;
  rank?: number;
}

// Interface defining the props required for the MissionActions component
interface MissionActionsProps {
  missionId: number;
  logs: { date: string; isDone: boolean }[];
  status: "ONGOING" | "COMPLETED" | "FAILED";
  onMissionUpdate: () => Promise<void>; // Callback function to refresh mission data
}

// Component handling mission actions such as marking completion and deletion
export default function MissionActions({
  missionId,
  logs,
  status,
  onMissionUpdate,
}: MissionActionsProps) {
  const [completeLoading, setCompleteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  // Get today's date in UTC format
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = format(today, "yyyy-MM-dd");

  const todayLog = logs.find(
    (log) => format(parseISO(log.date), "yyyy-MM-dd") === todayStr
  );
  const isCompletedToday = todayLog ? todayLog.isDone : false;

  // Handler to mark today's mission as completed
  const handleCompleteToday = async () => {
    if (isCompletedToday) return; // Prevent duplicate completion

    setCompleteLoading(true);
    try {
      // Send a request to update today's mission status
      const response = await fetch(
        `/api/user-missions/${missionId}/complete-today`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark mission as completed for today.");
      }

      const result = await response.json();

      // Check if the mission was fully completed and new badges were earned
      if (
        result.isCompleted &&
        result.newBadges &&
        Array.isArray(result.newBadges) &&
        result.newBadges.length > 0
      ) {
        // Ensure the badges have the correct structure
        const typedBadges: Badge[] = result.newBadges.map(
          (badge: BadgeResponse) => ({
            id: badge.id,
            title: badge.title,
            description: badge.description,
            rank: badge.rank,
          })
        );

        setEarnedBadges(typedBadges);
        setShowBadgeModal(true);
      } else {
        alert("Mission marked as completed for today!");
        await onMissionUpdate(); // Only refresh data when no badges are shown
      }
    } catch (error) {
      console.error(error);
      alert("Failed to complete mission.");
    } finally {
      setCompleteLoading(false);
    }
  };

  // Handler to close the badge modal and refresh data
  const handleBadgeModalClose = async () => {
    setShowBadgeModal(false);
    // Wait a short time before refreshing to let the modal close animation finish
    setTimeout(async () => {
      await onMissionUpdate();
    }, 300);
  };

  // Handler to delete the mission
  const handleDeleteMission = async () => {
    // Confirmation dialog before deletion
    if (
      !confirm(
        "Are you sure you want to delete this mission? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      // Send a DELETE request to remove the mission
      const response = await fetch(`/api/user-missions/${missionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete mission.");
      }

      alert("Mission deleted successfully.");
      await onMissionUpdate(); // Refresh mission data after deletion
    } catch (error) {
      console.error(error);
      alert("Failed to delete mission.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="mt-2 flex space-x-2">
        {/* Button to mark today's mission as completed */}
        <button
          className={`px-4 py-2 rounded-lg transition ${
            isCompletedToday || status === "COMPLETED"
              ? "bg-green-500 text-white cursor-not-allowed shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
              : "bg-gray-300 text-gray-600 transition-all duration-200 ease-in-out hover:bg-green-500 hover:text-white shadow-inner hover:shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
          }`}
          onClick={handleCompleteToday}
          disabled={
            isCompletedToday ||
            status === "COMPLETED" ||
            completeLoading ||
            deleteLoading
          }
        >
          {isCompletedToday || status === "COMPLETED"
            ? "Completed"
            : completeLoading
            ? "Completing..."
            : "Complete Today"}
        </button>

        {/* Button to delete the mission */}
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
          onClick={handleDeleteMission}
          disabled={deleteLoading || completeLoading}
        >
          {deleteLoading ? "Deleting..." : "Delete Mission"}
        </button>
      </div>

      {/* Badge Earned Modal */}
      {showBadgeModal && (
        <BadgeModal badges={earnedBadges} onClose={handleBadgeModalClose} />
      )}
    </>
  );
}
