// app/api/proxy/route.ts — Server-side proxy to Google Apps Script
import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Actions that do NOT require a JWT token (public endpoints).
 * The proxy will NOT forward the Authorization header for these,
 * which prevents GAS from returning NO_TOKEN for unauthenticated flows.
 */
const PUBLIC_ACTIONS = new Set(["login", "register", "daftarAkun", "aktivasiPembimbing"]);


async function fetchGAS(
  url: string,
  options: RequestInit,
  maxRedirects = 10
): Promise<Response> {
  let currentUrl = url;
  let currentOptions = { ...options };

  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, {
      ...currentOptions,
      redirect: "manual",
    });
    if (res.status < 300 || res.status >= 400) {
      return res;
    }
    const location = res.headers.get("location");
    if (!location) {
      return res;
    }

    currentUrl = location;
    currentOptions = {
      method: "GET",
      headers: {},
      redirect: "manual",
    };
  }

  throw new Error("Too many redirects");
}

export async function GET(request: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500 }
    );
  }

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  const auth = request.headers.get("Authorization");
  if (auth && !searchParams.has("Authorization")) {
    searchParams.set("Authorization", auth);
  }

  const url = `${GAS_URL}?${searchParams.toString()}`;

  try {
    const res = await fetchGAS(url, { method: "GET" });
    const data = await res.text();

    console.log("[Proxy GET] status:", res.status, "body length:", data.length);

    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Proxy GET Error]", err);
    return NextResponse.json(
      { success: false, message: "Proxy error", error: String(err) },
      { status: 502 }
    );
  }
}


export async function POST(request: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();

    // Detect action for public-endpoint bypass
    let action: string | undefined;
    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(rawBody);
      action = typeof parsedBody?.action === "string" ? parsedBody.action : undefined;
    } catch {
      // body isn't JSON — leave action undefined
    }

    const isPublic = action ? PUBLIC_ACTIONS.has(action) : false;
    const auth = request.headers.get("Authorization");

    let finalBody = rawBody;
    if (!isPublic && auth) {
      try {
        parsedBody["Authorization"] = auth;
        finalBody = JSON.stringify(parsedBody);
      } catch {
        // keep rawBody as-is
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    console.log(
      `[Proxy POST] action=${action ?? "unknown"} public=${isPublic} body length:`,
      finalBody.length
    );

    const res = await fetchGAS(GAS_URL, {
      method: "POST",
      headers,
      body: finalBody,
    });

    const data = await res.text();
    console.log(
      "[Proxy POST] Response status:",
      res.status,
      "body:",
      data.substring(0, 300)
    );

    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Proxy POST Error]", err);
    return NextResponse.json(
      { success: false, message: "Proxy error", error: String(err) },
      { status: 502 }
    );
  }
}

