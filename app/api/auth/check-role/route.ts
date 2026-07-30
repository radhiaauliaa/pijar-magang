// app/api/auth/check-role/route.ts — Live Role Detection API by Email
import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Known user registry fallback (matching Google Sheets Users database)
const KNOWN_ROLES: Record<string, "admin" | "pembimbing" | "mahasiswa"> = {
  "magangplnup3pdg@gmail.com": "admin",
  "archivepage00@gmail.com": "pembimbing",
  "nanda@gmail.com": "pembimbing",
  "panjul@gmail.com": "pembimbing",
  "radhiaaulia993@gmail.com": "mahasiswa",
  "storyralisa@gmail.com": "mahasiswa",
  "radhiaulian@gmail.com": "mahasiswa",
};

export async function GET(request: NextRequest) {
  const emailParam = request.nextUrl.searchParams.get("email");
  if (!emailParam) {
    return NextResponse.json({ success: false, role: null });
  }

  const cleanEmail = emailParam.trim().toLowerCase();

  // 1. Direct match in local registry (0ms latency)
  if (KNOWN_ROLES[cleanEmail]) {
    return NextResponse.json({ success: true, role: KNOWN_ROLES[cleanEmail] });
  }

  // 2. Try fetching live role from Google Apps Script database
  if (GAS_URL) {
    try {
      const url = `${GAS_URL}?action=checkRole&email=${encodeURIComponent(cleanEmail)}`;
      const res = await fetch(url, { method: "GET", next: { revalidate: 10 } });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.role) {
          return NextResponse.json({ success: true, role: json.data.role });
        }
      }
    } catch (err) {
      console.warn("[CheckRole Proxy Error]", err);
    }
  }

  // 3. Fallback heuristics for unlisted emails
  if (
    cleanEmail.includes("admin") ||
    cleanEmail.includes("up3") ||
    cleanEmail.includes("magangpln") ||
    cleanEmail.endsWith("@admin.pln.co.id")
  ) {
    return NextResponse.json({ success: true, role: "admin" });
  }

  if (
    cleanEmail.includes("pembimbing") ||
    cleanEmail.includes("supervisor") ||
    cleanEmail.includes("bimbingan") ||
    cleanEmail.endsWith("@pln.co.id")
  ) {
    return NextResponse.json({ success: true, role: "pembimbing" });
  }

  return NextResponse.json({ success: true, role: "mahasiswa" });
}
