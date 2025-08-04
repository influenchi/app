/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
    const {
      campaignTitle,
      campaignGoals,
      budgetType,
      budget,
      productDescription,
      targetAudience,
      brandName,
      companyName
    } = body;

    if (!campaignTitle) {
      return NextResponse.json(
        { error: 'Campaign title is required' },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert campaign strategist helping brands create compelling campaign descriptions for influencer marketing. 

Create a professional, engaging campaign description based on the following information:

CAMPAIGN DETAILS:
- Campaign Title: ${campaignTitle}
- Campaign Goals: ${campaignGoals?.join(', ') || 'Content Creation'}
- Budget Type: ${budgetType?.join(', ') || 'Paid'}
- Budget: ${budget || 'Not specified'}
- Product/Service: ${productDescription || 'Not specified'}

BRAND INFORMATION:
- Brand Name: ${brandName || companyName || 'Your Brand'}

TARGET AUDIENCE:
- Demographics: ${targetAudience?.ageRange?.join(', ') || 'Not specified'}
- Gender: ${targetAudience?.gender || 'Any'}
- Location: ${targetAudience?.location?.join(', ') || 'Global'}
- Interests: ${targetAudience?.interests?.join(', ') || 'General'}

REQUIREMENTS:
1. Write a compelling campaign description (50-150 words)
2. Include the campaign's value proposition
3. Specify what type of creator would be ideal
4. Mention key brand guidelines and content expectations
5. Include a clear call-to-action
6. Make it authentic and engaging
7. Focus on the benefits for both the creator and their audience

The tone should be professional yet approachable, inspiring creators to participate while clearly communicating expectations.

Generate ONLY the campaign description text, no additional formatting or labels.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ description: text });

  } catch (error) {
    console.error('Gemini API error:', error);

    const fallbackDescription = `Create engaging content showcasing ${body.campaignTitle || 'our brand'}. We're looking for authentic storytelling that resonates with your audience while highlighting the key features and benefits. Please ensure your content aligns with our brand values and maintains a professional yet approachable tone. Include clear calls-to-action and use relevant hashtags to maximize reach and engagement.`;

    return NextResponse.json({
      description: fallbackDescription,
      fallback: true
    });
  }
}