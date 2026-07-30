// app/api/drive-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url");
  const idParam = searchParams.get("id");

  let fileId = idParam || "";
  if (!fileId && urlParam) {
    const fileDMatch = urlParam.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch) fileId = fileDMatch[1];

    const idMatch = urlParam.match(/id=([a-zA-Z0-9_-]+)/);
    if (!fileId && idMatch) fileId = idMatch[1];

    const lh3Match = urlParam.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (!fileId && lh3Match) fileId = lh3Match[1];
  }

  if (!fileId) {
    if (urlParam && urlParam.startsWith("http")) {
      try {
        const res = await fetch(urlParam, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      } catch {
        return new NextResponse("Failed to fetch image", { status: 500 });
      }
    }
    return new NextResponse("Missing file ID or URL", { status: 400 });
  }

  // Try fetching Google Drive thumbnail / CDN streams
  const cdnUrls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=s800`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];

  for (const cdnUrl of cdnUrls) {
    try {
      const res = await fetch(cdnUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        // Return image stream if valid
        if (contentType.includes("image") || buffer.byteLength > 500) {
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType.includes("image") ? contentType : "image/jpeg",
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        }
      }
    } catch (e) {
      console.error(`Drive image fetch failed for ${cdnUrl}:`, e);
    }
  }

  return new NextResponse("Image not found or permission denied", { status: 404 });
}
