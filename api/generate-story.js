// Vercel Serverless Function for Story Generation
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        console.log('📥 Received story generation request');
        const { medicalText } = req.body;
        
        if (!medicalText) {
            return res.status(400).json({ error: 'Medical text is required' });
        }

        if (!CLAUDE_API_KEY) {
            return res.status(500).json({ error: 'Claude API key not configured' });
        }

        console.log('🤖 Calling Claude API...');
        
        const prompt = createKidFriendlyPrompt(medicalText);
        
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            console.error('❌ Claude API error:', response.status, response.statusText);
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Claude API response received');
        
        // Parse the response
        const storyPages = parseStoryResponse(data.content[0].text);
        
        res.json({
            success: true,
            pages: storyPages,
            rawResponse: data.content[0].text
        });

    } catch (error) {
        console.error('❌ Error generating story:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
}

// Helper functions
function createKidFriendlyPrompt(medicalText) {
    return `You are a magical storyteller who helps children understand their doctor visits. Transform this medical conversation into a kid-friendly storybook with 4-6 pages.

MEDICAL CONVERSATION:
"${medicalText}"

REQUIREMENTS:
1. Keep all medical facts EXACTLY accurate - don't change what happened
2. Use kid-friendly language and metaphors
3. Make it positive and reassuring
4. Structure as a story with a beginning, middle, and end
5. Include encouraging messages about being brave
6. Replace medical terms with fun equivalents:
   - stethoscope → "magic listening tool"
   - blood pressure cuff → "arm hugger"
   - thermometer → "temperature detector"
   - injection → "tiny superhero medicine"
   - X-ray → "special photo machine"

FORMAT your response as JSON:
{
  "title": "My Amazing Doctor Visit Adventure",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page title here",
      "content": "Story content for this page...",
      "illustration": "🏥"
    }
  ]
}

Make sure the story is accurate to what actually happened but presented in a way a 5-8 year old would understand and enjoy.`;
}

function parseStoryResponse(responseText) {
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const storyData = JSON.parse(jsonMatch[0]);
            return storyData.pages || [];
        }
    } catch (error) {
        console.error('Failed to parse AI response:', error);
    }
    
    return [{
        pageNumber: 1,
        title: "My Doctor Visit Story",
        content: "Today I had a special visit with my health hero doctor!",
        illustration: "🏥"
    }];
}