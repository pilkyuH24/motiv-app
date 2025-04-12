// lib/hooks/useUserMissions.ts
import { useState, useEffect } from 'react';
import { UserMission } from '@/types/mission';

export function useUserMissions() {
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshMissions = async (forceRefresh = true) => {
    setLoading(true);
    try {
      // 강제 새로고침 파라미터 추가
      const url = forceRefresh ? "/api/user-missions?refresh=true" : "/api/user-missions";
      
      const response = await fetch(url, {
        // 캐시 방지 헤더 추가
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
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
    // 초기 로드시에는 캐시된 데이터를 사용해도 됨
    refreshMissions(false);
  }, []);

  return { userMissions, loading, error, refreshMissions };
}