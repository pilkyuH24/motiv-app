//lib/badgeEngine.ts
import { prisma } from "@/lib/prisma";
import { Badge, UserMission, Mission } from "@prisma/client";
import { subDays } from "date-fns";
import { aggregateSuccessByDate } from "./badgeEngineHelpers";

// 타입 정의
type CompletedMission = UserMission & { mission: Mission };

interface BadgeStats {
  missions_completed: number;
  missions_ongoing: number;
  weekly_success_count: number;
  monthly_success_count: number;
  [key: string]: number | boolean;
}

interface BadgeCondition {
  [key: string]: boolean | string;
}

// 숫자 조건 평가
function evaluateNumericCondition(condition: string, actual: number): boolean {
  const match = condition.match(/(>=|<=|==|>|<)\s*(\d+)/);
  if (!match) return false;

  const [, operator, thresholdStr] = match;
  const threshold = parseInt(thresholdStr);

  switch (operator) {
    case ">=": return actual >= threshold;
    case "<=": return actual <= threshold;
    case "==": return actual === threshold;
    case ">": return actual > threshold;
    case "<": return actual < threshold;
    default: return false;
  }
}

// 뱃지 조건 평가
async function evaluateBadgeCondition(
  userId: number,
  badge: Badge,
  stats: BadgeStats
): Promise<boolean> {
  const condition = JSON.parse(badge.condition) as BadgeCondition;

  for (const [key, value] of Object.entries(condition)) {
    const actual = stats[key];

    if (typeof value === "boolean") {
      if (actual !== value) return false;
    } else if (typeof value === "string") {
      const isConditionMet = evaluateNumericCondition(value, actual as number);
      if (!isConditionMet) return false;
    } else {
      return false; // 예상 못한 타입
    }
  }

  return true;
}

// 미션 타입별 통계 추가
function addMissionTypeStats(stats: BadgeStats, completedMissions: CompletedMission[]) {
  const types = ["HEALTH", "SELF_DEVELOPMENT", "PRODUCTIVITY", "MINDFULNESS", "RELATIONSHIP"];

  for (const type of types) {
    const key = `mission_type_${type}`;
    stats[key] = completedMissions.filter(m => m.mission.type === type).length;
  }
}

// 사용자 통계 수집
async function getUserStats(userId: number): Promise<BadgeStats> {
  const [missions, logs] = await Promise.all([
    prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
    }),
    prisma.userMissionLog.findMany({
      where: { userMission: { userId } },
    }),
  ]);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const completedMissions = missions.filter(m => m.status === "COMPLETED");
  const ongoingMissions = missions.filter(m => m.status === "ONGOING");

  const logMap = aggregateSuccessByDate(logs);
  const sevenDaysAgo = subDays(today, 7);
  const thirtyDaysAgo = subDays(today, 30);

  let weekly_success_count = 0;
  let monthly_success_count = 0;

  for (const [dateStr, isDone] of logMap.entries()) {
    const date = new Date(dateStr);
    if (isDone && date >= sevenDaysAgo) weekly_success_count++;
    if (isDone && date >= thirtyDaysAgo) monthly_success_count++;
  }

  const stats: BadgeStats = {
    missions_completed: completedMissions.length,
    missions_ongoing: ongoingMissions.length,
    weekly_success_count,
    monthly_success_count,
  };

  addMissionTypeStats(stats, completedMissions);

  return stats;
}

// 뱃지 평가 및 지급
export async function evaluateAllBadgesForUser(userId: number) {
  const [badges, existingUserBadges] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId } }),
  ]);

  const ownedBadgeIds = new Set(existingUserBadges.map(b => b.badgeId));
  const stats = await getUserStats(userId);
  const newlyAwardedBadges: Badge[] = [];

  for (const badge of badges) {
    if (ownedBadgeIds.has(badge.id)) continue;

    const isEligible = await evaluateBadgeCondition(userId, badge, stats);

    if (isEligible) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newlyAwardedBadges.push(badge);
    }
  }

  return newlyAwardedBadges;
}
