// types/badge.ts

export type BadgeRank = 1 | 2 | 3 | 4;

export interface Badge {
  id: number;
  title: string;
  description: string | null;
  rank?: BadgeRank;
}

export interface BadgeDB extends Badge {
  condition: string; // JSON string
}

export interface BadgeCondition {
  [key: string]: boolean | string; // from JSON
}

export interface BadgeStats {
  missions_completed: number;
  missions_ongoing: number;
  weekly_success_count: number;
  monthly_success_count: number;
  [key: string]: number | boolean;
}

export interface BadgeResponse {
  message: string;
  isCompleted?: boolean;
  newBadges: Badge[];
}
