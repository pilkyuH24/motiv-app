// app/api/user-missions/complete-today/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { evaluateAllBadgesForUser } from "@/lib/badgeEngine";
import { Badge } from "@prisma/client";
import { authenticateUser, extractMissionId, verifyMissionOwnership } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;

    // Extract mission ID from URL
    const url = new URL(req.url);
    const idResult = extractMissionId(url, 'secondLast');
    if (idResult.error) return idResult.error;

    // Verify mission ownership (including mission data)
    const ownershipResult = await verifyMissionOwnership(
      idResult.missionId, 
      authResult.user.id,
      { mission: true }
    );
    if (ownershipResult.error) return ownershipResult.error;

    const userMission = ownershipResult.userMission;

    // 오늘 날짜를 UTC 기준 자정으로 계산(롤백)
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const todayFormatted = format(todayUTC, "yyyy-MM-dd");

    // Create or update mission log for today (UTC 기준)
    await prisma.userMissionLog.upsert({
      where: { userMissionId_date: { userMissionId: idResult.missionId, date: todayUTC } },
      update: { isDone: true },
      create: { userMissionId: idResult.missionId, date: todayUTC, isDone: true },
    });

    // Check if today is the mission's end date (UTC 기준)
    const isEndDate = userMission.endDate 
      ? format(userMission.endDate, "yyyy-MM-dd") === todayFormatted
      : false;

    let newlyAwardedBadges: { id: number; title: string; description: string | null, rank: number }[] = [];

    if (isEndDate && userMission.status !== "COMPLETED") {
      await prisma.userMission.update({
        where: { id: idResult.missionId },
        data: { status: "COMPLETED" },
      });

      try {
        const badgesResult = await evaluateAllBadgesForUser(authResult.user.id);
        if (Array.isArray(badgesResult)) {
          newlyAwardedBadges = badgesResult.map((badge: Badge) => ({
            id: badge.id,
            title: badge.title,
            description: badge.description,
            rank: badge.rank
          }));
        }
      } catch (error) {
        console.error("Error evaluating badges:", error);
        newlyAwardedBadges = [];
      }
    }

    return NextResponse.json({ 
      message: "Mission completed for today (UTC)!",
      isCompleted: isEndDate,
      newBadges: newlyAwardedBadges
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing mission:", errorMessage);

    return NextResponse.json({ message: "Failed to complete mission", error: errorMessage }, { status: 500 });
  }
}
