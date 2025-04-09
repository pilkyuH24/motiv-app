// 서버 사이드 캐시 모듈
// - 사용자별 미션 데이터를 메모리에 저장하여 불필요한 DB 요청을 줄입니다.
// - 캐시된 데이터는 일정 시간 후 자동으로 만료되며, 명시적으로 무효화할 수도 있습니다.
// - 전역 Map 객체를 사용한 단순한 메모리 기반 캐싱이며, 서버가 재시작되면 초기화됩니다.
// - 일정 주기로 만료된 항목을 정리하여 메모리 사용을 관리합니다.

export const CACHE_TTL = 60 * 1000; // 캐시 유효 시간: 1분

// 전역 메모리 캐시 객체
export const missionsCache = new Map();

/**
 * 특정 사용자의 미션 캐시를 무효화합니다.
 * @param userId 사용자 ID
 * @returns 캐시가 삭제되었는지 여부
 */
export function invalidateUserMissionsCache(userId: number) {
  const cacheKey = `missions-${userId}`;
  
  if (missionsCache.has(cacheKey)) {
    console.log(`[server-cache] Invalidating missions cache for user ${userId}`);
    missionsCache.delete(cacheKey);
    return true;
  }
  
  return false;
}

/**
 * 캐시에 데이터를 저장합니다.
 * @param key 캐시 키
 * @param data 저장할 데이터
 * @returns 저장 시각의 timestamp
 */
export function setCache(key: string, data: any) {
  const timestamp = Date.now();
  missionsCache.set(key, {
    data,
    timestamp,
  });
  return timestamp;
}

/**
 * 캐시된 데이터를 조회합니다.
 * @param key 캐시 키
 * @param maxAge 허용되는 최대 유효 시간 (기본값: 1분)
 * @returns 유효한 캐시 데이터 또는 null
 */
export function getCache(key: string, maxAge = CACHE_TTL) {
  if (!missionsCache.has(key)) {
    return null;
  }

  const { data, timestamp } = missionsCache.get(key);
  const isExpired = Date.now() - timestamp > maxAge;

  if (isExpired) {
    missionsCache.delete(key);
    return null;
  }

  return { data, timestamp };
}

//전체 캐시를 초기화합니다.
export function clearAllCache() {
  console.log(`[server-cache] Clearing all cache (${missionsCache.size} entries)`);
  missionsCache.clear();
}

// 주기적으로 만료된 캐시 항목을 정리 (30분 간격)
const CLEANUP_INTERVAL = 30 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const before = missionsCache.size;

    for (const [key, { timestamp }] of missionsCache.entries()) {
      if (Date.now() - timestamp > CACHE_TTL) {
        missionsCache.delete(key);
      }
    }

    const after = missionsCache.size;
    if (before !== after) {
      console.log(`[server-cache] Cleaned up ${before - after} expired cache entries`);
    }
  }, CLEANUP_INTERVAL);
}
