// app/api/universitas/route.ts
import { NextRequest, NextResponse } from "next/server";

const PDDIKTI_BASE = "https://api-pddikti.ridwaanhall.com";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get("keyword") ?? "";

  if (!keyword || keyword.trim().length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const url = `${PDDIKTI_BASE}/pt/search/${encodeURIComponent(keyword.trim())}`;
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      // cache selama 5 menit
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`PDDikti API error: ${res.status}`);

    const json = await res.json();

    const raw: Array<{ nama_pt?: string; nama?: string }> =
      json?.data_pt ?? json?.results ?? json?.data ?? [];

    const names: string[] = raw
      .map((item) => item.nama_pt ?? item.nama ?? "")
      .filter(Boolean)
      .slice(0, 12);

    return NextResponse.json({ data: names });
  } catch (err) {
    console.error("[Universitas API]", err);
    return NextResponse.json({ data: [], error: "api_error" });
  }
}
