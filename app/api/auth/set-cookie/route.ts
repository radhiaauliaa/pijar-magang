import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/constants/config";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(CONFIG.TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
