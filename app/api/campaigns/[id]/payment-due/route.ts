import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // First, get the campaign details to verify ownership and get content requirements
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, brand_id, content_items, budget_type')
      .eq('id', campaignId)
      .eq('brand_id', session.user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get all accepted creators for this campaign
    const { data: acceptedApplications, error: applicationsError } = await supabaseAdmin
      .from('campaign_applications')
      .select('creator_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'accepted');

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    if (!acceptedApplications || acceptedApplications.length === 0) {
      return NextResponse.json({ creatorsDueForPayment: [] });
    }

    const creatorIds = acceptedApplications.map(app => app.creator_id);

    // Get creator profiles
    const { data: creatorProfiles, error: creatorsError } = await supabaseAdmin
      .from('creators')
      .select(`
        user_id,
        display_name,
        profile_photo
      `)
      .in('user_id', creatorIds);

    // Get user details
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email
      `)
      .in('id', creatorIds);

    if (creatorsError) {
      console.error('Error fetching creators:', creatorsError);
      return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });
    }

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Get all submissions for this campaign
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('campaign_submissions')
      .select(`
        creator_id,
        task_id,
        content_type,
        social_channel,
        quantity,
        status,
        submitted_date,
        approved_date
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'approved');

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    // Parse campaign content requirements
    const contentRequirements = campaign.content_items || [];

    // Check which creators have completed all their required submissions
    const creatorsDueForPayment = creatorIds.filter(creatorId => {
      const creatorSubmissions = submissions?.filter(sub => sub.creator_id === creatorId) || [];

      // Check if creator has completed all required content items
      const hasCompletedAllRequirements = contentRequirements.every((requirement, requirementIndex) => {
        // More flexible matching logic to handle type conversions and variations
        const matchingSubmissions = creatorSubmissions.filter(sub => {
          // Enhanced task ID matching to handle both new format and legacy format
          let taskIdMatch = false;

          // Direct match (new format)
          if (String(sub.task_id) === String(requirement.id)) {
            taskIdMatch = true;
          }
          // Legacy format fallback: check if task_id matches the 1-based index
          // Legacy submissions used (index + 1), so task_id "1" should match requirement at index 0
          else if (String(sub.task_id) === String(requirementIndex + 1)) {
            taskIdMatch = true;
          }

          // Case-insensitive content type matching
          const contentTypeMatch = sub.content_type?.toLowerCase() === requirement.contentType?.toLowerCase();

          // Case-insensitive social channel matching
          const socialChannelMatch = sub.social_channel?.toLowerCase() === requirement.socialChannel?.toLowerCase();

          return taskIdMatch && contentTypeMatch && socialChannelMatch;
        });

        const submittedQuantity = matchingSubmissions.reduce((total, sub) => total + (sub.quantity || 1), 0);
        return submittedQuantity >= (requirement.quantity || 1);
      });

      return hasCompletedAllRequirements && contentRequirements.length > 0;
    });

    // Format the response with creator details and completion info
    const paymentData = creatorsDueForPayment.map(creatorId => {
      const creatorSubmissions = submissions?.filter(sub => sub.creator_id === creatorId) || [];
      const completionDate = Math.max(...creatorSubmissions.map(sub => new Date(sub.approved_date || sub.submitted_date).getTime()));

      const user = users?.find(u => u.id === creatorId);
      const creatorProfile = creatorProfiles?.find(c => c.user_id === creatorId);

      return {
        creatorId,
        creatorName: creatorProfile?.display_name || `${user?.first_name} ${user?.last_name}`,
        email: user?.email,
        profilePhoto: creatorProfile?.profile_photo,
        completedDate: new Date(completionDate).toISOString(),
        submissionCount: creatorSubmissions.length,
        totalRequirements: contentRequirements.length,
        budgetType: campaign.budget_type
      };
    });

    return NextResponse.json({
      creatorsDueForPayment: paymentData,
      campaignBudgetType: campaign.budget_type
    });

  } catch (error) {
    console.error('Payment due check error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
