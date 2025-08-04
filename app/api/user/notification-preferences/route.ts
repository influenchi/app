import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user notification settings
    const { data: notificationSettings, error } = await supabaseAdmin
      .from('user_notification_settings')
      .select(`
        id,
        user_id,
        email_campaign_updates,
        email_creator_messages,
        email_payment_alerts,
        email_weekly_reports,
        email_marketing_emails,
        push_campaign_updates,
        push_creator_messages,
        push_payment_alerts,
        push_urgent_alerts,
        desktop_browser_notifications,
        desktop_sound_alerts,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification settings:', error);
      return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
    }

    // If no notification settings exist, return default settings
    if (!notificationSettings) {
      const defaultSettings = {
        email: {
          campaignUpdates: true,
          creatorMessages: true,
          paymentAlerts: true,
          weeklyReports: false,
          marketingEmails: false
        },
        push: {
          campaignUpdates: true,
          creatorMessages: true,
          paymentAlerts: true,
          urgentAlerts: true
        },
        desktop: {
          browserNotifications: true,
          soundAlerts: false
        }
      };
      return NextResponse.json({ notificationSettings: defaultSettings });
    }

    // Map database fields to frontend format
    const mappedSettings = {
      email: {
        campaignUpdates: notificationSettings.email_campaign_updates,
        creatorMessages: notificationSettings.email_creator_messages,
        paymentAlerts: notificationSettings.email_payment_alerts,
        weeklyReports: notificationSettings.email_weekly_reports,
        marketingEmails: notificationSettings.email_marketing_emails
      },
      push: {
        campaignUpdates: notificationSettings.push_campaign_updates,
        creatorMessages: notificationSettings.push_creator_messages,
        paymentAlerts: notificationSettings.push_payment_alerts,
        urgentAlerts: notificationSettings.push_urgent_alerts
      },
      desktop: {
        browserNotifications: notificationSettings.desktop_browser_notifications,
        soundAlerts: notificationSettings.desktop_sound_alerts
      }
    };

    return NextResponse.json({ notificationSettings: mappedSettings });

  } catch (error) {
    console.error('Notification settings fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, push, desktop } = body;

    if (!email || !push || !desktop) {
      return NextResponse.json({ error: "Missing notification settings data" }, { status: 400 });
    }

    // Check if notification settings exist
    const { data: existingSettings } = await supabaseAdmin
      .from('user_notification_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const settingsData = {
      email_campaign_updates: email.campaignUpdates,
      email_creator_messages: email.creatorMessages,
      email_payment_alerts: email.paymentAlerts,
      email_weekly_reports: email.weeklyReports,
      email_marketing_emails: email.marketingEmails,
      push_campaign_updates: push.campaignUpdates,
      push_creator_messages: push.creatorMessages,
      push_payment_alerts: push.paymentAlerts,
      push_urgent_alerts: push.urgentAlerts,
      desktop_browser_notifications: desktop.browserNotifications,
      desktop_sound_alerts: desktop.soundAlerts,
      updated_at: new Date().toISOString()
    };

    if (existingSettings) {
      // Update existing settings
      const { data: updatedSettings, error } = await supabaseAdmin
        .from('user_notification_settings')
        .update(settingsData)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification settings:', error);
        return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        notificationSettings: updatedSettings
      });
    } else {
      // Create new settings
      const { data: newSettings, error } = await supabaseAdmin
        .from('user_notification_settings')
        .insert({
          user_id: session.user.id,
          ...settingsData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification settings:', error);
        return NextResponse.json({ error: "Failed to create notification settings" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        notificationSettings: newSettings
      });
    }

  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}