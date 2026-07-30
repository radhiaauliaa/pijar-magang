// lib/AuthBackContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

interface AuthBackContextType {
  customBackHandler: (() => void) | null;
  setCustomBackHandler: (handler: (() => void) | null) => void;
}

const AuthBackContext = createContext<AuthBackContextType>({
  customBackHandler: null,
  setCustomBackHandler: () => {},
});

export function AuthBackProvider({ children }: { children: React.ReactNode }) {
  const [customBackHandler, setCustomBackHandler] = useState<(() => void) | null>(null);

  return (
    <AuthBackContext.Provider value={{ customBackHandler, setCustomBackHandler }}>
      {children}
    </AuthBackContext.Provider>
  );
}

export function useAuthBack() {
  return useContext(AuthBackContext);
}
