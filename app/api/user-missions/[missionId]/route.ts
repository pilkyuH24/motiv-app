// api/user-missions/[missionId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser, extractMissionId, verifyMissionOwnership } from "@/lib/auth-utils";

export async function DELETE(req: Request) {
  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;

    const url = new URL(req.url);
    const idResult = extractMissionId(url);
    if (idResult.error) return idResult.error;

    const userId = authResult.user.id;
    const missionId = idResult.missionId;

    const ownershipResult = await verifyMissionOwnership(missionId, userId);
    if (ownershipResult.error) return ownershipResult.error;

    // Transactional delete
    await prisma.$transaction(async (tx) => {
      await tx.userMissionLog.deleteMany({
        where: { userMissionId: missionId },
      });
      await tx.userMission.delete({
        where: { id: missionId },
      });
    });

    console.log("Mission deleted successfully.");
    return NextResponse.json(
      { message: "Mission deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting mission:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to delete mission", error: errorMessage },
      { status: 500 }
    );
  }
}
