// app/api/user/delete/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-utils";

export async function DELETE() {
  const authResult = await authenticateUser();
  if (authResult.error) return authResult.error;

  const userId = authResult.user.id;

  try {
    console.log("Deleting user with ID:", userId); // DEBUG

    // Perform user data deletion in a transaction
    // Order: mission logs → badges → missions → user account
    // Rolls back all changes if any step fails
    await prisma.$transaction(async (tx) => {
      await tx.userMissionLog.deleteMany({
        where: {
          userMission: {
            userId: userId
          }
        }
      });

      await tx.userBadge.deleteMany({
        where: { userId }
      });

      await tx.userMission.deleteMany({
        where: { userId }
      });

      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ success: true, message: "Account successfully deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the account." },
      { status: 500 }
    );
  }
}
