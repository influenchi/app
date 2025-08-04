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
    const { action, totpCode, password } = body;

    if (!action) {
      return NextResponse.json({
        error: "Action is required (generate, verify, or disable)"
      }, { status: 400 });
    }

    try {
      if (action === 'generate') {
        // Generate QR code and secret for 2FA setup
        // This is a placeholder - Better Auth may have specific methods for this

        const secret = generateTOTPSecret(); // You'll need to implement this
        const qrCodeUrl = generateQRCode(session.user.email || '', secret); // You'll need to implement this

        // Store the temporary secret in session or database
        // Don't enable 2FA until user verifies the code

        return NextResponse.json({
          secret,
          qrCodeUrl,
          manualEntryKey: secret
        });

      } else if (action === 'verify') {
        if (!totpCode) {
          return NextResponse.json({
            error: "TOTP code is required for verification"
          }, { status: 400 });
        }

        // Verify the TOTP code and enable 2FA
        // This would integrate with Better Auth's 2FA verification

        // For now, simulate successful verification
        const isValid = totpCode === '123456'; // This should be real TOTP verification

        if (!isValid) {
          return NextResponse.json({
            error: "Invalid verification code"
          }, { status: 400 });
        }

        // Enable 2FA for the user
        // Generate backup codes
        const backupCodes = generateBackupCodes(); // You'll need to implement this

        return NextResponse.json({
          success: true,
          message: "Two-factor authentication enabled successfully",
          backupCodes
        });

      } else if (action === 'disable') {
        if (!password) {
          return NextResponse.json({
            error: "Password is required to disable 2FA"
          }, { status: 400 });
        }

        // Verify password and disable 2FA
        // This would integrate with Better Auth's password verification

        return NextResponse.json({
          success: true,
          message: "Two-factor authentication disabled successfully"
        });

      } else {
        return NextResponse.json({
          error: "Invalid action"
        }, { status: 400 });
      }

    } catch (authError) {
      console.error('2FA setup error:', authError);
      return NextResponse.json({
        error: "2FA setup failed"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('2FA setup request error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Placeholder functions - you'll need to implement these with proper libraries
function generateTOTPSecret(): string {
  // Use a library like 'speakeasy' to generate TOTP secret
  return 'JBSWY3DPEHPK3PXP'; // Placeholder
}

function generateQRCode(email: string, secret: string): string {
  const issuer = 'Influenchi';
  const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  // Use a QR code library to generate the QR code image URL
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

function generateBackupCodes(): string[] {
  // Generate 8 backup codes
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
}