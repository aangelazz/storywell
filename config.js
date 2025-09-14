// Configuration file for AI integration
// Replace 'YOUR_CLAUDE_API_KEY_HERE' with your actual Claude API key

const AI_CONFIG = {
    // Your Claude API key from console.anthropic.com
    CLAUDE_API_KEY: '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',
    
    // Model settings (Claude Haiku is cost-effective for this use case)
    MODEL: 'claude-3-haiku-20240307',
    
    // Enable/disable AI features
    USE_AI: true,
    
    // Cost tracking
    BUDGET_LIMIT: 1000, // Your $1000 budget
    
    // Story settings
    MAX_PAGES: 6,
    TARGET_AGE_RANGE: '5-8 years old'
};

// Cost per story estimate: ~$0.01-0.05 per story
// With $1000, you can generate approximately 20,000-100,000 stories

export default AI_CONFIG;