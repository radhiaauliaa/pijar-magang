// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: {
    default: "PIJAR - Internship Management System",
    template: `%s | PIJAR`,
  },
  description: CONFIG.APP_DESCRIPTION,
  keywords: ["magang", "monitoring", "mahasiswa", "internship", "pln", "pijar"],
  robots: "index, follow",
  icons: {
    icon: "/logo_pijar.png",
    shortcut: "/logo_pijar.png",
    apple: "/logo_pijar.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

