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
      companyName,
      brandDescription,
      website,
      logoUrl
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
- Company: ${companyName || brandName || 'Your Company'}
- Brand Description: ${brandDescription || 'Not specified'}
- Website: ${website || 'Not specified'}

TARGET AUDIENCE:
- Demographics: ${targetAudience?.ageRange?.join(', ') || 'Not specified'}
- Gender: ${targetAudience?.gender || 'Any'}
- Location: ${targetAudience?.location?.join(', ') || 'Global'}
- Interests: ${targetAudience?.interests?.join(', ') || 'General'}

REQUIREMENTS:
1. Write a compelling campaign description (50-150 words)
2. Include the campaign's value proposition and brand story
3. Specify what type of creator would be ideal for this brand
4. Reference the brand's personality and values from the description
5. Mention key content expectations that align with the brand identity
6. Include a clear call-to-action that reflects the brand voice
7. Make it authentic and engaging, true to the brand's character
8. Focus on the mutual benefits - brand exposure for creators, authentic content for the brand
9. If budget type is 'gifted', emphasize the product value and experience
10. If website is provided, subtly reference the brand's digital presence

The tone should match the brand's personality (professional, casual, luxury, etc.) while being inspiring and clear about expectations. Use the brand description to inform the voice and style.

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