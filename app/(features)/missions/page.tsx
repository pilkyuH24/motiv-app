// Missions page
"use client";

import { useState } from "react";
import Loader from "@/components/ui/Loader";
import Navbar from "@/components/layout/navbar";
import { useMissions } from "@/lib/hooks/useMissions";
import { Mission, MissionFormData } from "@/types/mission";
import MissionTypeSection from "@/components/missions/MissionTypeSection";
import MissionStartForm from "@/components/missions/MissionStartForm";

export default function MissionsPage() {
  const { missions, loading } = useMissions();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Group missions by type
  const groupedMissions = missions.reduce((acc, mission) => {
    if (!acc[mission.type]) acc[mission.type] = [];
    acc[mission.type].push(mission);
    return acc;
  }, {} as Record<string, Mission[]>);

  const handleOpenMissionForm = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleCloseMissionForm = () => {
    setSelectedMission(null);
  };

  const handleStartMission = async (formData: MissionFormData & { mission: Mission }) => {
    try {
      const start = new Date(formData.startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(formData.endDate);

      const response = await fetch("/api/user-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: formData.mission.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          repeatType: formData.repeatType,
          repeatDays:
            formData.repeatType === "CUSTOM"
              ? formData.repeatDays
              : [false, false, false, false, false, false, false],
        }),
      });

      if (!response.ok) {
        throw new Error("Mission already exists or fail to be added.");
      }

      alert("Mission started successfully!");
      handleCloseMissionForm();
    } catch (error) {
      console.error(error);
      alert("Failed to start mission. Please try again.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {Object.entries(groupedMissions).map(([type, typeMissions]) => (
        <MissionTypeSection
          key={type}
          type={type}
          missions={typeMissions}
          onStartMission={handleOpenMissionForm}
        />
      ))}

      {selectedMission && (
        <MissionStartForm
          mission={selectedMission}
          onClose={handleCloseMissionForm}
          onSubmit={handleStartMission}
        />
      )}
    </div>
  );
}