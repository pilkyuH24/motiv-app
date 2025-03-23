import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handles GET requests to retrieve the list of missions
export async function GET() {
  try {
    // Fetch all missions from the database
    const missions = await prisma.mission.findMany();
    // console.log("🧪 missions from DB:", missions);
    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Error fetching missions:", error); 
    // Return a 500 response in case of an error
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}