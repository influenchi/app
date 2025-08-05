import { sendEmail, EmailTemplate } from './email';
import { supabaseAdmin } from './supabase-admin';

// Notification trigger functions that integrate with existing API routes
export class NotificationService {

  // Brand notifications
  static async sendBrandWelcome(userId: string, firstName: string, email: string) {
    await sendEmail({
      to: email,
      subject: 'Welcome to Influenchi – Let\'s Launch Your First Campaign',
      template: 'brand_welcome_signup',
      templateData: { userId, firstName }
    });
  }

  static async sendBrandNudgeCampaignCreation(userId: string, firstName: string, email: string) {
    await sendEmail({
      to: email,
      subject: 'Need Help Launching Your First Campaign?',
      template: 'brand_nudge_campaign_creation',
      templateData: { userId, firstName }
    });
  }

  static async sendBrandCampaignLive(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string) {
    await sendEmail({
      to: email,
      subject: `Your Campaign "${campaignTitle}" Is Live`,
      template: 'brand_campaign_live',
      templateData: { userId, firstName, campaignId, campaignTitle }
    });
  }

  static async sendBrandCreatorApplied(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string, creatorName: string) {
    await sendEmail({
      to: email,
      subject: `${creatorName} Applied to "${campaignTitle}"`,
      template: 'brand_creator_applied',
      templateData: { userId, firstName, campaignId, campaignTitle, creatorName }
    });
  }

  static async sendBrandMessageReceived(userId: string, firstName: string, email: string, campaignTitle: string, creatorName: string) {
    await sendEmail({
      to: email,
      subject: `New Message from ${creatorName} on "${campaignTitle}"`,
      template: 'brand_message_received',
      templateData: { userId, firstName, campaignTitle, creatorName }
    });
  }

  static async sendBrandContentSubmitted(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string, creatorName: string) {
    await sendEmail({
      to: email,
      subject: `${creatorName} Submitted Content for "${campaignTitle}"`,
      template: 'brand_content_submitted',
      templateData: { userId, firstName, campaignId, campaignTitle, creatorName }
    });
  }

  static async sendBrandCampaignCompleted(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string) {
    await sendEmail({
      to: email,
      subject: `Download Your Content from "${campaignTitle}"`,
      template: 'brand_campaign_completed',
      templateData: { userId, firstName, campaignId, campaignTitle }
    });
  }

  static async sendBrandReviewReceived(userId: string, firstName: string, email: string, campaignTitle: string, creatorName: string, reviewText: string) {
    await sendEmail({
      to: email,
      subject: 'Your Creator Left You a Review',
      template: 'brand_review_received',
      templateData: { userId, firstName, campaignTitle, creatorName, reviewText }
    });
  }

  static async sendBrandCampaignBoostReminder(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string) {
    await sendEmail({
      to: email,
      subject: 'Get More Creators on Your Campaign',
      template: 'brand_campaign_boost_reminder',
      templateData: { userId, firstName, campaignId, campaignTitle }
    });
  }

  // Creator notifications
  static async sendCreatorWelcome(userId: string, firstName: string, email: string) {
    await sendEmail({
      to: email,
      subject: 'Welcome to Influenchi – Start Applying to Campaigns',
      template: 'creator_welcome_signup',
      templateData: { userId, firstName }
    });
  }

  static async sendCreatorNudgeFirstApplication(userId: string, firstName: string, email: string) {
    await sendEmail({
      to: email,
      subject: 'Start Applying to Travel Collabs Today',
      template: 'creator_nudge_first_application',
      templateData: { userId, firstName }
    });
  }

  static async sendCreatorApplicationConfirmation(userId: string, firstName: string, email: string, campaignTitle: string, brandName: string) {
    await sendEmail({
      to: email,
      subject: `You Applied to "${campaignTitle}"`,
      template: 'creator_application_confirmation',
      templateData: { userId, firstName, campaignTitle, brandName }
    });
  }

  static async sendCreatorAcceptedToCampaign(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string, brandName: string) {
    await sendEmail({
      to: email,
      subject: `You've Been Selected for "${campaignTitle}"`,
      template: 'creator_accepted_to_campaign',
      templateData: { userId, firstName, campaignId, campaignTitle, brandName }
    });
  }

  static async sendCreatorMessageReceived(userId: string, firstName: string, email: string, campaignTitle: string, brandName: string) {
    await sendEmail({
      to: email,
      subject: `New Message from ${brandName} on "${campaignTitle}"`,
      template: 'creator_message_received',
      templateData: { userId, firstName, campaignTitle, brandName }
    });
  }

  static async sendCreatorSubmissionReminder(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string) {
    await sendEmail({
      to: email,
      subject: `Reminder: Submit Your Content for "${campaignTitle}"`,
      template: 'creator_submission_reminder',
      templateData: { userId, firstName, campaignId, campaignTitle }
    });
  }

  static async sendCreatorContentApproved(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string, brandName: string, approved: boolean) {
    await sendEmail({
      to: email,
      subject: 'Your Content Was Approved 🎉',
      template: 'creator_content_approved',
      templateData: { userId, firstName, campaignId, campaignTitle, brandName, approved }
    });
  }

  static async sendCreatorCampaignCompleted(userId: string, firstName: string, email: string, campaignId: string, campaignTitle: string, brandName: string) {
    await sendEmail({
      to: email,
      subject: 'Campaign Complete – Great Job!',
      template: 'creator_campaign_completed',
      templateData: { userId, firstName, campaignId, campaignTitle, brandName }
    });
  }

  static async sendCreatorReviewReceived(userId: string, firstName: string, email: string, campaignTitle: string, brandName: string, reviewText: string) {
    await sendEmail({
      to: email,
      subject: `You Got a Review from ${brandName}!`,
      template: 'creator_review_received',
      templateData: { userId, firstName, campaignTitle, brandName, reviewText }
    });
  }

  // Team invitation email
  static async sendTeamInvitation(inviteEmail: string, inviterName: string, brandName: string, role: string, inviteToken: string) {
    await sendEmail({
      to: inviteEmail,
      subject: `You're invited to join ${brandName} on Influenchi`,
      template: 'team_invitation',
      templateData: {
        userId: 'system', // System email, no user-specific preferences
        inviteEmail,
        inviterName,
        brandName,
        role,
        inviteToken,
        acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/team/accept/${inviteToken}`
      }
    });
  }

  // Helper function to create in-app notification and optionally send email
  static async createNotification(userId: string, type: string, title: string, message: string, data: any = {}) {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data
        });

      if (error) {
        console.error('Failed to create notification:', error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Check if user should receive nudge emails based on signup/activity dates
  static async checkAndSendDelayedNotifications() {
    try {
      // Check for brands who signed up 72 hours ago with no campaigns
      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

      const { data: brandsToNudge } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name')
        .eq('user_type', 'brand')
        .lt('created_at', threeDaysAgo.toISOString())
        .not('id', 'in', `(SELECT DISTINCT brand_id FROM campaigns WHERE created_at > '${threeDaysAgo.toISOString()}')`);

      if (brandsToNudge) {
        for (const brand of brandsToNudge) {
          await this.sendBrandNudgeCampaignCreation(brand.id, brand.first_name, brand.email);
        }
      }

      // Check for creators who signed up 24 hours ago with no applications
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data: creatorsToNudge } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name')
        .eq('user_type', 'creator')
        .lt('created_at', oneDayAgo.toISOString())
        .not('id', 'in', `(SELECT DISTINCT creator_id FROM campaign_applications WHERE created_at > '${oneDayAgo.toISOString()}')`);

      if (creatorsToNudge) {
        for (const creator of creatorsToNudge) {
          await this.sendCreatorNudgeFirstApplication(creator.id, creator.first_name, creator.email);
        }
      }

      // Check for campaigns with no activity 5-7 days after launch
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data: campaignsToBoost } = await supabaseAdmin
        .from('campaigns')
        .select(`
          id, 
          title, 
          brand_id,
          users!campaigns_brand_id_fkey(id, email, first_name)
        `)
        .eq('status', 'active')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lt('created_at', fiveDaysAgo.toISOString())
        .eq('applicant_count', 0);

      if (campaignsToBoost) {
        for (const campaign of campaignsToBoost) {
          await this.sendBrandCampaignBoostReminder(
            campaign.brand_id,
            campaign.users.first_name,
            campaign.users.email,
            campaign.id,
            campaign.title
          );
        }
      }

    } catch (error) {
      console.error('Error checking delayed notifications:', error);
    }
  }
}
