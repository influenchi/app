import { createAuthClient } from "better-auth/react";
import type { Session } from "./types/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
});

export const {
  signIn,
  signUp,
  signOut,
  useSession: baseUseSession,
  getSession,
  requestPasswordReset,
  resetPassword
} = authClient;

// Type-safe useSession hook
export const useSession = () => {
  const session = baseUseSession();
  return {
    ...session,
    data: session.data as Session | null
  };
}; 