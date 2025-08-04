import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Check if user has 2FA enabled using Better Auth
      // This will depend on Better Auth's 2FA implementation
      // For now, we'll return a default response

      // In a real implementation, you'd check the user's 2FA status from the database
      // or Better Auth's 2FA methods

      const twoFactorEnabled = false; // This should come from Better Auth or database

      return NextResponse.json({
        twoFactorEnabled,
        backupCodes: twoFactorEnabled ? 8 : 0 // Number of unused backup codes
      });

    } catch (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json({
        error: "Authentication service error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}