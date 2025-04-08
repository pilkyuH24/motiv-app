//lib/hooks/useMissions.ts
import { useState, useEffect } from 'react';

interface Mission {
  id: number;
  title: string;
  description?: string;
  rewardPoints: number;
  type: string;
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch("/api/missions");
        if (!response.ok) {
          throw new Error("Failed to fetch missions");
        }
        const data = await response.json();
        setMissions(data);
      } catch (error) {
        console.error("Error fetching missions:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  return { missions, loading, error };
}