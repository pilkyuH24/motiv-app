import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    // Extract `missionId` from the request URL
    const url = new URL(req.url);
    const missionId = parseInt(url.pathname.split("/").pop() || "");

    if (isNaN(missionId)) {
      return NextResponse.json({ message: "Invalid mission ID" }, { status: 400 });
    }

    // console.log(`Deleting mission: ${missionId}`);

    // Step 1: Delete all related `UserMissionLog` entries first to avoid foreign key constraint errors
    await prisma.userMissionLog.deleteMany({
      where: { userMissionId: missionId },
    });

    // Step 2: Delete the `UserMission` entry
    await prisma.userMission.delete({
      where: { id: missionId },
    });

    console.log("Mission deleted successfully.");
    return NextResponse.json({ message: "Mission deleted successfully." });
  } catch (error) {
    console.error("Error deleting mission:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to delete mission", error: errorMessage }, { status: 500 });
  }
}
