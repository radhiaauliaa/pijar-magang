// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, addNotification } from "@/lib/notifications-store";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    const role = request.nextUrl.searchParams.get("role");
    const notifications = getNotifications(email || undefined, role || undefined);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, all, email, action, title, message, type, user_email, role } = body;

    if (action === "add" && title && message) {
      const created = addNotification({ title, message, type, user_email, role });
      return NextResponse.json({ success: true, data: created });
    }

    if (all) {
      markAllNotificationsAsRead(email);
    } else if (id) {
      markNotificationAsRead(id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
