//lib/badgeEngine.ts
import { prisma } from "@/lib/prisma";
import { Badge, UserMission, Mission } from "@prisma/client";
import { subDays } from "date-fns";
import { aggregateSuccessByDate } from "./badgeEngineHelpers";

// Type
type CompletedMission = (UserMission & { mission: Mission });

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

// Badge condition check
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
      continue;
    }

    if (typeof value === "string") {
      const isConditionMet = evaluateNumericCondition(value, actual as number);
      if (!isConditionMet) return false;
      continue;
    }

    return false;
  }

  return true;
}

// Evaluation by numbers
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

// Collect stats, General(cross-sectional) condition Eval
async function getUserStats(userId: number): Promise<BadgeStats> {
  const [missions, logs] = await Promise.all([
    prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
    }),
    prisma.userMissionLog.findMany({
      where: { userMission: { userId } },
      orderBy: { date: "desc" },
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
    const raw = new Date(dateStr);
    const date = new Date(Date.UTC(raw.getFullYear(), raw.getMonth(), raw.getDate()));
  
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

// Stats based on mission types
function addMissionTypeStats(stats: BadgeStats, completedMissions: CompletedMission[]): void {
  const types = ["HEALTH", "SELF_DEVELOPMENT", "PRODUCTIVITY", "MINDFULNESS", "RELATIONSHIP"];

  for (const type of types) {
    const typeKey = `mission_type_${type}`;
    stats[typeKey] = completedMissions.filter(m => m.mission.type === type).length;
  }
}

// All badge eval
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
