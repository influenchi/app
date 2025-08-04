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
      // Get all active sessions for the user
      const result = await auth.api.listSessions({
        headers: request.headers
      });

      if (result.error) {
        console.error('Failed to fetch sessions:', result.error);
        return NextResponse.json({
          error: "Failed to fetch sessions"
        }, { status: 500 });
      }

      // Transform sessions data for frontend
      const sessions = result.data?.map((sessionData: any) => ({
        id: sessionData.id,
        device: sessionData.userAgent ? parseUserAgent(sessionData.userAgent) : 'Unknown Device',
        browser: sessionData.userAgent ? parseBrowser(sessionData.userAgent) : 'Unknown Browser',
        location: sessionData.ipAddress ? 'Unknown Location' : 'Unknown Location', // You might want to add IP geolocation
        lastActive: sessionData.expiresAt ? formatLastActive(sessionData.expiresAt) : 'Unknown',
        current: sessionData.id === session.sessionId,
        ipAddress: sessionData.ipAddress
      })) || [];

      return NextResponse.json({ sessions });

    } catch (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json({
        error: "Authentication service error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('revokeAll') === 'true';

    try {
      if (revokeAll) {
        // Revoke all other sessions (keep current session)
        const result = await auth.api.revokeOtherSessions({
          headers: request.headers
        });

        if (result.error) {
          console.error('Failed to revoke sessions:', result.error);
          return NextResponse.json({
            error: "Failed to revoke sessions"
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "All other sessions revoked successfully"
        });
      } else if (sessionId) {
        // Revoke specific session
        const result = await auth.api.revokeSession({
          body: { sessionId },
          headers: request.headers
        });

        if (result.error) {
          console.error('Failed to revoke session:', result.error);
          return NextResponse.json({
            error: "Failed to revoke session"
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "Session revoked successfully"
        });
      } else {
        return NextResponse.json({
          error: "Session ID is required"
        }, { status: 400 });
      }

    } catch (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json({
        error: "Authentication service error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Session revocation error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper functions to parse user agent
function parseUserAgent(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

function formatLastActive(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = now.getTime() - expires.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}