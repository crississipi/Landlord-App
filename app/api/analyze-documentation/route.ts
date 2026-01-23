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

    // Helper to call OpenRouter with retry/backoff and tolerant parsing
    const callOpenRouter = async () => {
      const payload = {
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert maintenance documentation specialist analyzing BEFORE and AFTER images of property repairs.${contextInfo}\nAnalyze the provided documentation images and create a detailed description of the repair work that was performed.\n\nProvide your response in this exact JSON format:\n{\n  "description": "Detailed description in English of what was repaired and how. Describe the condition before (if visible) and after the repair. Include specific details about materials used if visible, quality of work, and completeness of repair. (3-5 sentences)",\n  "description_tl": "Detalyadong paglalarawan sa Tagalog ng mga ginawang pag-aayos. Ilarawan ang kondisyon bago (kung nakikita) at pagkatapos ng repair. Isama ang mga detalye tungkol sa mga materyales na ginamit kung nakikita, kalidad ng trabaho, at pagkakumpleto ng pag-aayos. (3-5 pangungusap)",\n  "work_done": "Brief summary of the repair work completed in English (1-2 sentences)",\n  "work_done_tl": "Maikling buod ng natapos na pag-aayos sa Tagalog (1-2 pangungusap)",\n  "confidence_score": 0.0-1.0\n}\n\nFocus on:\n- What specific repair work was done\n- The quality of the repair visible in images\n- Any visible materials or tools used\n- Whether the repair appears complete and professional\n\nKeep descriptions clear and professional. This is for landlord documentation purposes.`
              },
              ...imageContents
            ]
          }
        ]
      };

      const maxAttempts = 3;
      let attempt = 0;
      let lastError: any = null;

      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const res = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
              'X-Title': 'Coliving Landlord Documentation AI'
            },
            body: JSON.stringify({ ...payload, temperature: 0.3, max_tokens: 1500, response_format: { type: 'json_object' } })
          });

          if (!res.ok) {
            const txt = await res.text();
            lastError = new Error(`OpenRouter ${res.status}: ${txt}`);
            // Retry on rate-limit and server errors
            if ([429, 502, 503, 504].includes(res.status) && attempt < maxAttempts) {
              const wait = 500 * attempt;
              await new Promise(r => setTimeout(r, wait));
              continue;
            }
            throw lastError;
          }

          const body = await res.json();

          // OpenRouter may return content as object or string
          const rawContent = body?.choices?.[0]?.message?.content;
          let parsed: any = null;

          if (!rawContent) {
            throw new Error('No content returned from OpenRouter');
          }

          if (typeof rawContent === 'object') {
            parsed = rawContent;
          } else if (typeof rawContent === 'string') {
            try {
              parsed = JSON.parse(rawContent);
            } catch (e) {
              // If string isn't strict JSON, try to extract a JSON substring
              const m = rawContent.match(/\{[\s\S]*\}/);
              if (m) {
                try { parsed = JSON.parse(m[0]); } catch (_) { parsed = { text: rawContent }; }
              } else {
                parsed = { text: rawContent };
              }
            }
          }

          return { success: true, parsed };
        } catch (err) {
          lastError = err;
          if (attempt < maxAttempts) {
            const wait = 400 * attempt;
            await new Promise(r => setTimeout(r, wait));
            continue;
          }
          throw lastError;
        }
      }
      throw lastError;
    };

    const callResult = await callOpenRouter();

    if (!callResult || !callResult.success) {
      return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }

    const parsed = callResult.parsed || {};

    const analysis: AnalysisResult = {
      success: true,
      description: parsed.description || 'Documentation images analyzed',
      description_tl: parsed.description_tl || 'Na-analyze ang mga larawan ng dokumentasyon',
      work_done: parsed.work_done || parsed.work_done_tl || parsed.text || 'Repair work completed',
      work_done_tl: parsed.work_done_tl || '',
      confidence_score: parsed.confidence_score || 0.8
    };

    return NextResponse.json({ success: true, result: analysis, imagesAnalyzed: imageContents.length });

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
