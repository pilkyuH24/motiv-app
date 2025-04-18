//lib/hooks/useMissions.ts
import { useState, useEffect } from 'react';
import { Mission, MissionResponse, MissionType } from "@/types/mission";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch("/api/missions");
        if (!response.ok) throw new Error("Failed to fetch missions");

        const rawData: MissionResponse[] = await response.json();

        const typedMissions = rawData.map((m) => ({
          ...m,
          type: m.type as MissionType, // MissionType 단언
        })) as Mission[];

        setMissions(typedMissions);
      } catch (error) {
        console.error("Error fetching missions:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  return { missions, loading, error };
}
