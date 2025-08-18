import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        error: "Current password and new password are required"
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        error: "New password must be at least 8 characters long"
      }, { status: 400 });
    }

    try {
      // Use Better Auth's changePassword method
      const result = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false // Keep other sessions active by default
        },
        headers: request.headers
      });

      if (result.error) {
        console.error('Password change error:', result.error);

        // Handle specific error cases
        if (result.error.message?.includes('Invalid password')) {
          return NextResponse.json({
            error: "Current password is incorrect"
          }, { status: 400 });
        }

        return NextResponse.json({
          error: result.error.message || "Failed to change password"
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Password changed successfully"
      });

    } catch (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json({
        error: "Authentication service error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Password change request error:', error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}