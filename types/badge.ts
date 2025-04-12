// types/badge.ts

// 뱃지 등급: 숫자가 낮을수록 높은 등급 (1 = 최고)
export type BadgeRank = 1 | 2 | 3 | 4;

// 클라이언트에서 사용하는 기본 Badge 형태
export interface Badge {
  id: number;
  title: string;
  description: string | null;
  rank?: BadgeRank;
}

// 데이터베이스에서 사용되는 뱃지 타입 (조건 포함)
export interface BadgeDB extends Badge {
  condition: string; // JSON string으로 저장된 조건 객체
}

// 뱃지 조건 구조 - evaluateBadgeCondition() 내부에서 파싱하여 사용
export interface BadgeCondition {
  [key: string]: boolean | string;
  /**
   * 예시:
   * {
   *   "missions_completed": ">= 5",            // 총 완료 미션 5개 이상
   *   "missions_ongoing": "== 3",              // 현재 진행 중 미션 정확히 3개
   *   "mission_type_HEALTH": ">= 3",           // HEALTH 유형 미션 3개 이상 완료
   *   "weekly_success_count": ">= 5",          // 지난 7일 동안 성공 횟수 5회 이상
   *   "monthly_success_count": ">= 20",        // 지난 30일 동안 성공 횟수 20회 이상
   * }
   */
}

// 유저의 미션 통계 데이터 - evaluateBadgeCondition()에서 비교 대상
export interface BadgeStats {
  missions_completed: number;        // 총 완료된 미션 수
  missions_ongoing: number;          // 현재 진행 중인 미션 수
  weekly_success_count: number;      // 지난 7일간 성공한 로그 수
  monthly_success_count: number;     // 지난 30일간 성공한 로그 수

  // 미션 타입별 완료 수: "mission_type_HEALTH", "mission_type_PRODUCTIVITY" 등으로 동적 생성됨
  [key: string]: number | boolean;
}

// API 응답에서 뱃지 획득 결과를 나타내는 타입
export interface BadgeResponse {
  message: string;                   // 처리 메시지
  isCompleted?: boolean;            // 미션 완료 여부 (optional)
  newBadges: Badge[];               // 새로 획득한 뱃지 리스트
}
