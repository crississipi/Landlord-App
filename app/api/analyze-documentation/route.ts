import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AnalysisResult {
  success: boolean;
  description: string;
  description_tl: string;
  work_done: string;
  work_done_tl: string;
  confidence_score: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const maintenanceContext = formData.get('maintenanceContext') as string || '';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    // Process all images and combine descriptions
    const imageContents: { type: string; image_url: { url: string } }[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        imageContents.push({
          type: 'image_url',
          image_url: { url: dataUrl }
        });
      } catch (err) {
        console.error('Error processing file:', err);
      }
    }

    if (imageContents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to process images' },
        { status: 400 }
      );
    }

    // Build the prompt with maintenance context
    const contextInfo = maintenanceContext 
      ? `\n\nOriginal maintenance issue: "${maintenanceContext}"\n`
      : '';

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
        'X-Title': 'Coliving Landlord Documentation AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert maintenance documentation specialist analyzing BEFORE and AFTER images of property repairs.
${contextInfo}
Analyze the provided documentation images and create a detailed description of the repair work that was performed.

Provide your response in this exact JSON format:
{
  "description": "Detailed description in English of what was repaired and how. Describe the condition before (if visible) and after the repair. Include specific details about materials used if visible, quality of work, and completeness of repair. (3-5 sentences)",
  "description_tl": "Detalyadong paglalarawan sa Tagalog ng mga ginawang pag-aayos. Ilarawan ang kondisyon bago (kung nakikita) at pagkatapos ng repair. Isama ang mga detalye tungkol sa mga materyales na ginamit kung nakikita, kalidad ng trabaho, at pagkakumpleto ng pag-aayos. (3-5 pangungusap)",
  "work_done": "Brief summary of the repair work completed in English (1-2 sentences)",
  "work_done_tl": "Maikling buod ng natapos na pag-aayos sa Tagalog (1-2 pangungusap)",
  "confidence_score": 0.0-1.0
}

Focus on:
- What specific repair work was done
- The quality of the repair visible in images
- Any visible materials or tools used
- Whether the repair appears complete and professional

Keep descriptions clear and professional. This is for landlord documentation purposes.`
              },
              ...imageContents
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { success: false, error: `API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No analysis returned from AI' },
        { status: 500 }
      );
    }

    let analysis: AnalysisResult;
    try {
      const parsed = JSON.parse(content);
      analysis = {
        success: true,
        description: parsed.description || 'Documentation images analyzed',
        description_tl: parsed.description_tl || 'Na-analyze ang mga larawan ng dokumentasyon',
        work_done: parsed.work_done || 'Repair work completed',
        work_done_tl: parsed.work_done_tl || 'Natapos ang pag-aayos',
        confidence_score: parsed.confidence_score || 0.8
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      analysis = {
        success: false,
        description: content.substring(0, 500),
        description_tl: 'Hindi ma-parse ang sagot ng AI',
        work_done: 'Unable to parse response',
        work_done_tl: 'Hindi maintindihan ang resulta',
        confidence_score: 0.5,
        error: 'JSON parse error'
      };
    }

    return NextResponse.json({
      success: true,
      result: analysis,
      imagesAnalyzed: imageContents.length
    });

  } catch (error) {
    console.error('Error in analyze-documentation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
