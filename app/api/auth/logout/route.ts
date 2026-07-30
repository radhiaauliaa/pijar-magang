import { NextResponse } from "next/server";
import { CONFIG } from "@/constants/config";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(CONFIG.TOKEN_COOKIE_NAME);
  return response;
}
