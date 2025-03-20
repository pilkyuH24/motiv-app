import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth/[...nextauth]/route";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
            status: 401
        });
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    console.log('GET API', session, 'User-Agent:', userAgent);

    return NextResponse.json({ authenticated: !!session, userAgent });
}
