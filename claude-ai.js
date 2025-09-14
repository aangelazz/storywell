// Claude API Configuration
const CLAUDE_API_CONFIG = {
    apiKey: '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', // Your actual API key
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307', // Cost-effective model for your use case
    maxTokens: 2000
};

// AI Story Generation using Claude
class AIStoryGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async generateKidFriendlyStory(medicalText) {
        const prompt = this.createKidFriendlyPrompt(medicalText);
        
        try {
            const response = await fetch(CLAUDE_API_CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: CLAUDE_API_CONFIG.model,
                    max_tokens: CLAUDE_API_CONFIG.maxTokens,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseStoryResponse(data.content[0].text);
        } catch (error) {
            console.error('AI story generation failed:', error);
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

// Make AI generator globally available
window.aiStoryGenerator = new AIStoryGenerator(CLAUDE_API_CONFIG.apiKey);