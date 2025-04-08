// lib/hooks/useUserMissions.ts
import { useState, useEffect } from 'react';
import { UserMission } from '@/types/mission';

export function useUserMissions() {
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshMissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user-missions");
      if (!response.ok) {
        throw new Error("Failed to fetch missions");
      }
      const data = await response.json();
      setUserMissions(data);
    } catch (error) {
      console.error("Error fetching user missions:", error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMissions();
  }, []);

  return { userMissions, loading, error, refreshMissions };
}