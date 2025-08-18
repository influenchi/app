import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a scheduled job or cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run the delayed notification checks
    await NotificationService.checkAndSendDelayedNotifications();

    return NextResponse.json({ 
      success: true, 
      message: 'Delayed notifications processed successfully' 
    });
    
  } catch (error) {
    console.error('Error in scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    await NotificationService.checkAndSendDelayedNotifications();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Delayed notifications processed successfully (dev mode)' 
    });
    
  } catch (error) {
    console.error('Error in scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
