//app/api/user-badges/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;

    const userId = authResult.user.id;

    // Get all badges the user has earned
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    });

    // Format the badges for response
    const badges = userBadges.map((userBadge) => ({
      id: userBadge.badge.id,
      title: userBadge.badge.title,
      description: userBadge.badge.description,
      awardedAt: userBadge.awardedAt,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user badges:", errorMessage);

    return NextResponse.json(
      { message: "Failed to fetch user badges", error: errorMessage },
      { status: 500 }
    );
  }
}