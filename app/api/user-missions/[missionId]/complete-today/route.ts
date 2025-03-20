import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Extracts `missionId` from the URL
    const url = new URL(req.url);
    const missionId = parseInt(url.pathname.split("/").slice(-2, -1)[0]);

    if (isNaN(missionId)) {
      return NextResponse.json({ message: "Invalid mission ID" }, { status: 400 });
    }

    // Sets the current date in UTC with time set to 00:00:00 UTC
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // console.log(`Completing mission ${missionId} for today (UTC: ${todayUTC.toISOString()})`);

    // Updates the mission log for the given mission ID and date, or creates a new entry if it does not exist
    await prisma.userMissionLog.upsert({
      where: { userMissionId_date: { userMissionId: missionId, date: todayUTC } },
      update: { isDone: true },
      create: { userMissionId: missionId, date: todayUTC, isDone: true },
    });

    return NextResponse.json({ message: "Mission completed for today (UTC)!" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing mission:", errorMessage);

    return NextResponse.json({ message: "Failed to complete mission", error: errorMessage }, { status: 500 });
  }
}
