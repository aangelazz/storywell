const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for demo
    credentials: true
}));
app.use(express.json());

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Generate story endpoint
app.post('/api/generate-story', async (req, res) => {
    try {
        console.log('📥 Received story generation request');
        const { medicalText } = req.body;
        
        if (!medicalText) {
            return res.status(400).json({ error: 'Medical text is required' });
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!CLAUDE_API_KEY
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Storywell Backend API',
        endpoints: ['/api/health', '/api/generate-story'],
        status: 'running'
    });
});

// Helper functions (same as before)
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
    
    return parseTextResponse(responseText);
}

function parseTextResponse(text) {
    const pages = [];
    const sections = text.split(/Page \d+|Chapter \d+/i).filter(section => section.trim());
    
    sections.forEach((section, index) => {
        if (section.trim()) {
            pages.push({
                pageNumber: index + 1,
                title: `Chapter ${index + 1}`,
                content: section.trim(),
                illustration: getRandomIllustration()
            });
        }
    });

    return pages.length > 0 ? pages : createFallbackStory(text);
}

function getRandomIllustration() {
    const illustrations = ['🩺', '❤️', '🌟', '🎉', '🏆', '💊', '📸', '🦸‍♂️', '👨‍⚕️', '👩‍⚕️'];
    return illustrations[Math.floor(Math.random() * illustrations.length)];
}

function createFallbackStory(originalText) {
    return [{
        pageNumber: 1,
        title: "My Doctor Visit Story",
        content: "Today I had a special visit with my health hero doctor!",
        illustration: "🏥"
    }];
}

// For Vercel, export the app
module.exports = app;