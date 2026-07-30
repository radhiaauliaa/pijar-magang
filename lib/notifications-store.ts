// lib/notifications-store.ts
import type { Notification } from "@/types";

export interface StoredNotification extends Notification {
  user_email?: string;
  role?: string;
}

const notificationsStore: StoredNotification[] = [
  {
    id: "notif-welcome-init",
    type: "info",
    title: "Selamat Datang di PIJAR",
    message: "Platform terpadu monitoring magang PT PLN (Persero) UP3 Padang.",
    read: false,
    created_at: new Date().toISOString(),
  },
];

/**
 * Add a new in-app notification
 */
export function addNotification({
  title,
  message,
  type = "info",
  user_email,
  role,
}: {
  title: string;
  message: string;
  type?: Notification["type"];
  user_email?: string;
  role?: string;
}): StoredNotification {
  const newNotif: StoredNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
    user_email: user_email?.toLowerCase().trim(),
    role,
  };

  // Prevent exact duplicate notifications within short timeframe
  const isDuplicate = notificationsStore.some(
    (n) => n.title === title && n.message === message && n.user_email === newNotif.user_email
  );

  if (!isDuplicate) {
    notificationsStore.unshift(newNotif);
    console.log(`[Notification Manager] Added notification: "${title}" for ${user_email ?? role ?? "all"}`);
  }
  return newNotif;
}

/**
 * Get all notifications for user
 */
export function getNotifications(userEmail?: string, role?: string): Notification[] {
  if (!userEmail) return notificationsStore;
  const normalized = userEmail.toLowerCase().trim();
  
  return notificationsStore.filter((n) => {
    if (!n.user_email && !n.role) return true; // Global notifs like Welcome
    if (n.user_email && n.user_email === normalized) return true;
    if (n.role && role && n.role === role) return true;
    return false;
  });
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id: string): boolean {
  const target = notificationsStore.find((n) => n.id === id);
  if (target) {
    target.read = true;
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for user
 */
export function markAllNotificationsAsRead(userEmail?: string): void {
  const normalized = userEmail?.toLowerCase().trim();
  notificationsStore.forEach((n) => {
    if (!userEmail || !n.user_email || n.user_email === normalized) {
      n.read = true;
    }
  });
}
