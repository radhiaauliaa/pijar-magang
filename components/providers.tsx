// components/providers.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "@/lib/queryClient";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );

  // Wrap with GoogleOAuthProvider only when client ID is configured
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "your-google-client-id-here.apps.googleusercontent.com") {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}

