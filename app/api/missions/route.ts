import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handles GET requests to retrieve the list of missions
export async function GET() {
  try {
    // Fetch all missions from the DB
    const missions = await prisma.mission.findMany();
    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Error fetching missions:", error); 
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}