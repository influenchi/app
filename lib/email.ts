/* eslint-disable @typescript-eslint/no-explicit-any */
import sgMail from '@sendgrid/mail';
import { supabaseAdmin } from './supabase-admin';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email notification types and their SendGrid template mappings
export const EMAIL_TEMPLATES = {
  // Brand notifications
  brand_welcome_signup: 'd-c5f4a20f24a542aa9f9b03e83d70d443',
  brand_nudge_campaign_creation: 'd-04cd6f9f55a1427a9e5c91d46e2f6049',
  brand_campaign_live: 'd-7933c6f03f9e46e6b17d7c90ebd8dccc',
  brand_creator_applied: 'd-44b8ceb7c487433f83cc3dd293f20c2f',
  brand_message_received: 'd-7d255396bc4d49df9fb11df375269231',
  brand_content_submitted: 'd-53029d4025754a87a0bf931fbbeb9553',
  brand_campaign_completed: 'd-7e71d4c2ecbf4a66b67d2caf3b07d982',
  brand_review_received: 'd-17a7415547e349958881ecef5245e992',
  brand_campaign_boost_reminder: 'd-8c58d46fb3e04e96a5a441560fd64480',

  // Creator notifications
  creator_welcome_signup: 'd-ec6ad3b8ed3b437aabdd99faf2189bc1',
  creator_nudge_first_application: 'd-f964c0b497174df99ca89a502c004913',
  creator_application_confirmation: 'd-706080f8fa674bfa9c1334b6941e67d0',
  creator_accepted_to_campaign: 'd-f8b76be61a54418695f952305d87d5a9',
  creator_message_received: 'd-7e66b0f752264d66aece94060a525f29',
  creator_submission_reminder: 'd-e04a7b253f4e4264a8f9badbd60c43cc',
  creator_content_approved: 'd-ed354090743a43398ddc90429f4c7e88',
  creator_campaign_completed: 'd-f01022ece7a14e598e9f397a6497f2c8',
  creator_review_received: 'd-9ab302ad25d34a81a028c39b004d5d29',

  // Team invitation
  team_invitation: 'd-5760643a3fdd4a47a027212884bbf17b',
} as const;

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES;

interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  templateData: Record<string, any>;
}

export async function sendEmail({ to, subject, template, templateData }: EmailData) {
  try {
    console.log(`📧 Attempting to send email: ${template} to ${to}`);

    // Check user's email notification preferences
    const { data: settings } = await supabaseAdmin
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', templateData.userId)
      .single();

    // If user has disabled relevant email notifications, skip sending
    if (settings) {
      const shouldSkip = checkEmailPreferences(template, settings);
      if (shouldSkip) {
        console.log(`Email skipped due to user preferences: ${template} to ${to}`);
        return { success: true, skipped: true };
      }
    }

    const templateId = EMAIL_TEMPLATES[template];
    console.log(`🎯 Using template ID: ${templateId}`);

    const msg = {
      to,
      from: 'contact@influenchi.com',
      templateId,
      dynamicTemplateData: {
        ...templateData,
        subject,
        app_url: process.env.NEXT_PUBLIC_APP_URL,
      },
    };

    console.log(`📨 SendGrid message config:`, {
      to: msg.to,
      from: msg.from,
      templateId: msg.templateId,
      hasData: !!msg.dynamicTemplateData
    });

    const result = await sgMail.send(msg);

    console.log(`✅ Email sent successfully: ${template} to ${to}`, {
      statusCode: result[0]?.statusCode,
      messageId: result[0]?.headers?.['x-message-id']
    });
    return { success: true, messageId: result[0]?.headers?.['x-message-id'] };
  } catch (error: any) {
    console.error(`❌ Failed to send email: ${template} to ${to}`, {
      message: error.message,
      code: error.code,
      statusCode: error.response?.status,
      body: error.response?.body,
      stack: error.stack
    });

    // Log specific SendGrid error details
    if (error.response?.body?.errors) {
      console.error('🔍 SendGrid specific errors:', error.response.body.errors);
    }

    return { success: false, error };
  }
}

function checkEmailPreferences(template: EmailTemplate, settings: any): boolean {
  const templateMap: Record<string, string> = {
    brand_creator_applied: 'email_campaign_updates',
    brand_message_received: 'email_creator_messages',
    brand_content_submitted: 'email_campaign_updates',
    brand_campaign_completed: 'email_campaign_updates',
    brand_review_received: 'email_campaign_updates',
    creator_message_received: 'email_creator_messages',
    creator_accepted_to_campaign: 'email_campaign_updates',
    creator_content_approved: 'email_campaign_updates',
    creator_campaign_completed: 'email_campaign_updates',
    creator_review_received: 'email_campaign_updates',
  };

  const settingKey = templateMap[template];
  if (settingKey && settings[settingKey] === false) {
    return true; // Skip sending
  }

  return false; // Send email
}

// SendGrid will handle template rendering, so we no longer need HTML generation
