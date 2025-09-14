// Claude API Configuration
const CLAUDE_API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    maxTokens: 2000
};

// AI Story Generation using Claude
class AIStoryGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async generateKidFriendlyStory(medicalText) {
        try {
            console.log('🤖 Calling backend API...');
            
            // Determine backend URL based on environment
            let backendUrl;
            
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Local development
                backendUrl = 'http://localhost:3001';
            } else if (window.location.hostname === 'storywell.one') {
                // Production - using GitHub Pages, call Vercel backend
                backendUrl = 'https://storywell.vercel.app/api';
            } else if (window.location.hostname.includes('vercel.app')) {
                // On Vercel deployment - use relative path
                backendUrl = '/api';
            } else {
                // Other deployments
                backendUrl = 'https://storywell.vercel.app/api';
            }
            
            console.log('🔗 Backend URL:', backendUrl);
            console.log('🔍 Full API endpoint:', `${backendUrl}/generate-story`);
            
            const response = await fetch(`${backendUrl}/generate-story`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    medicalText: medicalText
                })
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.pages && data.pages.length > 0) {
                console.log('✅ AI story generated via backend!', data.pages.length, 'pages');
                return data.pages;
            } else {
                throw new Error('Invalid response from backend');
            }
            
        } catch (error) {
            console.error('❌ Backend API failed:', error);
            console.log('🔄 Falling back to enhanced local processing...');
            // Fallback to local processing
            return this.createFallbackStory(medicalText);
        }
    }

    createKidFriendlyPrompt(medicalText) {
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
      "illustration": "🏥" // emoji that fits the page
    }
  ]
}

Make sure the story is accurate to what actually happened but presented in a way a 5-8 year old would understand and enjoy.`;
    }

    parseStoryResponse(responseText) {
        try {
            // Extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const storyData = JSON.parse(jsonMatch[0]);
                return storyData.pages || [];
            }
        } catch (error) {
            console.error('Failed to parse AI response:', error);
        }
        
        // Fallback parsing if JSON format fails
        return this.parseTextResponse(responseText);
    }

    parseTextResponse(text) {
        // Simple text parsing if JSON fails
        const pages = [];
        const sections = text.split(/Page \d+|Chapter \d+/i).filter(section => section.trim());
        
        sections.forEach((section, index) => {
            if (section.trim()) {
                pages.push({
                    pageNumber: index + 1,
                    title: `Chapter ${index + 1}`,
                    content: section.trim(),
                    illustration: this.getRandomIllustration()
                });
            }
        });

        return pages.length > 0 ? pages : this.createFallbackStory(text);
    }

    createFallbackStory(originalText) {
        // Enhanced fallback with better medical term replacement
        const transformations = {
            'stethoscope': 'magic listening tool 🩺',
            'blood pressure': 'arm hugger machine',
            'thermometer': 'temperature detector 🌡️',
            'examination': 'special check-up adventure',
            'injection': 'tiny superhero medicine 💉',
            'vaccine': 'protection superpower shot',
            'prescription': 'special medicine instructions 💊',
            'checkup': 'health adventure',
            'doctor': 'health hero 👨‍⚕️',
            'nurse': 'caring helper 👩‍⚕️',
            'height': 'how tall I am 📏',
            'weight': 'how much I weigh ⚖️',
            'x-ray': 'special photo machine 📸',
            'ultrasound': 'peek-inside machine',
            'cast': 'superhero armor for healing',
            'bandage': 'healing wrap',
            'stitches': 'tiny repair threads'
        };

        let transformedText = originalText;
        Object.keys(transformations).forEach(medical => {
            const friendly = transformations[medical];
            const regex = new RegExp(medical, 'gi');
            transformedText = transformedText.replace(regex, friendly);
        });

        // Create story pages
        const sentences = transformedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const pages = [];

        // Title page
        pages.push({
            pageNumber: 1,
            title: "My Amazing Doctor Visit Adventure! 🏥",
            content: "Today I went on a special adventure to visit my health hero. Let me tell you all about it!",
            illustration: "🏥👨‍⚕️👩‍⚕️"
        });

        // Process sentences into pages
        sentences.forEach((sentence, index) => {
            let enhancedSentence = sentence.trim();
            
            // Add encouraging language
            if (enhancedSentence.toLowerCase().includes('brave') || 
                enhancedSentence.toLowerCase().includes('good') ||
                enhancedSentence.toLowerCase().includes('well')) {
                enhancedSentence += " I was such a brave little hero! 🦸‍♂️";
            }

            const illustrations = ['🩺', '📏', '⚖️', '👂', '👄', '❤️', '🌟', '🎉', '🏆', '💊', '📸'];
            const illustration = illustrations[index % illustrations.length];

            pages.push({
                pageNumber: index + 2,
                title: `Chapter ${index + 1}`,
                content: enhancedSentence + ".",
                illustration: illustration
            });
        });

        // Ending page
        pages.push({
            pageNumber: pages.length + 1,
            title: "The End of My Adventure! 🎉",
            content: "I finished my doctor visit and felt proud of how brave I was. The health heroes helped me stay strong and healthy. What an amazing adventure!",
            illustration: "🏆🌟🎉"
        });

        return pages;
    }

    getRandomIllustration() {
        const illustrations = ['🩺', '❤️', '🌟', '🎉', '🏆', '💊', '📸', '🦸‍♂️', '👨‍⚕️', '👩‍⚕️'];
        return illustrations[Math.floor(Math.random() * illustrations.length)];
    }
}

// Cost estimation helper
function estimateAPICost(textLength) {
    // Claude Haiku pricing: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
    const inputTokens = Math.ceil(textLength / 4); // Rough token estimation
    const outputTokens = 2000; // Max output we're requesting
    
    const inputCost = (inputTokens / 1000000) * 0.25;
    const outputCost = (outputTokens / 1000000) * 1.25;
    
    return {
        totalCost: inputCost + outputCost,
        storiesWithBudget: Math.floor(1000 / (inputCost + outputCost))
    };
}

// Initialize AI generator immediately when script loads
console.log('🤖 Initializing AI Story Generator...');
console.log('🔑 API Key available:', !!CLAUDE_API_CONFIG.apiKey);
console.log('🔑 API Key starts with:', CLAUDE_API_CONFIG.apiKey ? CLAUDE_API_CONFIG.apiKey.substring(0, 10) + '...' : 'MISSING');

try {
    window.aiStoryGenerator = new AIStoryGenerator(CLAUDE_API_CONFIG.apiKey);
    console.log('✅ AI Story Generator initialized successfully');
    console.log('🎯 Generator methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.aiStoryGenerator)));
    
    // Set a flag to indicate AI is ready
    window.AI_READY = true;
    
    // Dispatch a custom event to notify other scripts
    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('aiReady', { detail: { generator: window.aiStoryGenerator } }));
    }
} catch (error) {
    console.error('❌ Failed to initialize AI Story Generator:', error);
    window.AI_READY = false;
}