console.log('🚀 script.js is loading...');

// Test if we can see the claude-ai.js file
console.log('📂 Testing file structure...');
console.log('📋 Current page:', window.location.href);

class DoctorStorybookApp {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.currentPage = 0;
        this.storyPages = [];
        this.recognition = null;
        this.transcribedText = '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeSpeechRecognition();
    }

    initializeElements() {
        // Recording elements
        this.recordBtn = document.getElementById('recordBtn');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.statusText = document.getElementById('statusText');
        this.pulseAnimation = document.getElementById('pulseAnimation');
        this.audioPreview = document.getElementById('audioPreview');
        this.audioPlayback = document.getElementById('audioPlayback');
        this.retryBtn = document.getElementById('retryBtn');
        this.processBtn = document.getElementById('processBtn');

        // Section elements
        this.recordingSection = document.getElementById('recordingSection');
        this.processingSection = document.getElementById('processingSection');
        this.storybookSection = document.getElementById('storybookSection');
        this.processingText = document.getElementById('processingText');

        // Storybook elements
        this.storybookPages = document.getElementById('storybookPages');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.pageCounter = document.getElementById('pageCounter');
        this.saveStoryBtn = document.getElementById('saveStoryBtn');
        this.newStoryBtn = document.getElementById('newStoryBtn');
        this.shareStoryBtn = document.getElementById('shareStoryBtn');

        // Design layout elements (only on index.html)
        this.designLayout = document.querySelector('.design-layout');
        this.functionalInterface = document.getElementById('functionalInterface');
        this.startRecordingBtn = document.querySelector('.start-recording-btn');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        console.log('Record button found:', !!this.recordBtn);
        
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => {
                console.log('Record button clicked!');
                this.toggleRecording();
            });
        } else {
            console.error('Record button not found!');
        }
        
        if (this.retryBtn) this.retryBtn.addEventListener('click', () => this.retryRecording());
        if (this.processBtn) this.processBtn.addEventListener('click', () => this.processAudio());
        if (this.prevPageBtn) this.prevPageBtn.addEventListener('click', () => this.previousPage());
        if (this.nextPageBtn) this.nextPageBtn.addEventListener('click', () => this.nextPage());
        if (this.saveStoryBtn) this.saveStoryBtn.addEventListener('click', () => this.saveStory());
        if (this.newStoryBtn) this.newStoryBtn.addEventListener('click', () => this.createNewStory());
        if (this.shareStoryBtn) this.shareStoryBtn.addEventListener('click', () => this.shareStory());
        
        // Design layout button (only on index.html)
        if (this.startRecordingBtn) this.startRecordingBtn.addEventListener('click', () => this.startJourney());
        
        console.log('Event listeners set up complete');
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }

        if (this.recognition) {
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.transcribedText += finalTranscript + ' ';
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('Speech recognition had an issue. We\'ll use the audio recording instead!');
            };
        }
    }

    async toggleRecording() {
        console.log('Toggle recording called, isRecording:', this.isRecording);
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        console.log('Starting recording...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.transcribedText = '';

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (this.audioPlayback) {
                    this.audioPlayback.src = audioUrl;
                }
                if (this.audioPreview) {
                    this.audioPreview.style.display = 'block';
                }
                
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            console.log('MediaRecorder started');
            
            if (this.recognition) {
                try {
                    this.recognition.start();
                    console.log('Speech recognition started');
                } catch (error) {
                    console.warn('Speech recognition failed to start:', error);
                }
            }

            this.isRecording = true;
            this.updateRecordingUI();

        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showError('Could not access microphone. Please check your permissions and try again!');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        if (this.recognition) {
            this.recognition.stop();
        }

        this.isRecording = false;
        this.updateRecordingUI();
    }

    updateRecordingUI() {
        if (this.isRecording) {
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<span class="mic-icon">🔴</span><span class="btn-text">Stop Recording</span>';
            if (this.statusText) this.statusText.textContent = 'Recording... Tell me about your doctor visit!';
            if (this.pulseAnimation) this.pulseAnimation.style.display = 'block';
        } else {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<span class="mic-icon">🎤</span><span class="btn-text">Start Recording</span>';
            if (this.statusText) this.statusText.textContent = 'Recording finished! Listen to your recording below.';
            if (this.pulseAnimation) this.pulseAnimation.style.display = 'none';
        }
    }

    retryRecording() {
        if (this.audioPreview) this.audioPreview.style.display = 'none';
        this.transcribedText = '';
        if (this.statusText) this.statusText.textContent = 'Ready to record again!';
    }

    async processAudio() {
        this.showProcessingSection();
        await this.simulateProcessingSteps();
        this.generateStorybook();
    }

    showProcessingSection() {
        if (this.recordingSection) this.recordingSection.style.display = 'none';
        if (this.processingSection) this.processingSection.style.display = 'block';
    }

    async simulateProcessingSteps() {
        const steps = [
            'Listening to your story...',
            'Understanding what happened...',
            'Finding the perfect words...',
            'Adding magical touches...',
            'Creating your storybook pages...'
        ];

        for (let i = 0; i < steps.length; i++) {
            if (this.processingText) this.processingText.textContent = steps[i];
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    async generateStorybook() {
        const storyText = this.transcribedText.trim() || this.getSampleStoryText();
        
        console.log('🔄 Generating story from text:', storyText);
        
        // Check if AI is available
        if (window.aiStoryGenerator && typeof window.aiStoryGenerator.generateKidFriendlyStory === 'function') {
            try {
                console.log('🤖 Using AI to generate story...');
                if (this.processingText) {
                    this.processingText.textContent = 'Asking our AI storyteller to create your story...';
                }
                
                const aiPages = await window.aiStoryGenerator.generateKidFriendlyStory(storyText);
                
                if (aiPages && aiPages.length > 0) {
                    console.log('✅ AI story generated successfully:', aiPages);
                    // Convert AI response to our page format
                    this.storyPages = aiPages.map(page => ({
                        title: page.title,
                        content: page.content,
                        illustration: page.illustration
                    }));
                    this.displayStorybook();
                    return;
                }
            } catch (error) {
                console.error('❌ AI generation failed, using fallback:', error);
                if (this.processingText) {
                    this.processingText.textContent = 'Creating your story with our backup system...';
                }
            }
        } else {
            console.log('⚠️ AI generator not available, using fallback');
            console.log('🔍 Available:', typeof window.aiStoryGenerator);
        }
        
        // Fallback to local processing
        console.log('📝 Using local story processing...');
        this.storyPages = this.createStoryPages(storyText);
        this.displayStorybook();
    }

    getSampleStoryText() {
        return "I went to see Dr. Smith today for my checkup. She checked my height and weight. Then she listened to my heart with a stethoscope. She looked in my ears and throat with a special light. She said I was growing well and was very healthy. She gave me a sticker for being brave.";
    }

    createStoryPages(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const pages = [];

        pages.push({
            title: "My Amazing Doctor Visit Adventure! 🏥",
            content: "Today I went on a special adventure to visit my doctor. Let me tell you all about it!",
            illustration: "🏥👨‍⚕️👩‍⚕️"
        });

        const transformations = {
            'stethoscope': 'magic listening tool 🩺',
            'blood pressure': 'arm squeeze machine',
            'thermometer': 'temperature wand 🌡️',
            'examination': 'special check-up',
            'injection': 'tiny pinch medicine',
            'vaccine': 'superhero protection shot',
            'prescription': 'special medicine instructions',
            'checkup': 'health adventure',
            'doctor': 'health hero',
            'nurse': 'caring helper',
            'height': 'how tall I am',
            'weight': 'how much I weigh'
        };

        sentences.forEach((sentence, index) => {
            let transformedSentence = sentence.trim();
            
            Object.keys(transformations).forEach(medical => {
                const friendly = transformations[medical];
                const regex = new RegExp(medical, 'gi');
                transformedSentence = transformedSentence.replace(regex, friendly);
            });

            if (transformedSentence.toLowerCase().includes('brave') || 
                transformedSentence.toLowerCase().includes('good')) {
                transformedSentence += " I was such a brave little hero! 🦸‍♂️";
            }

            const illustrations = ['🩺', '📏', '⚖️', '👂', '👄', '❤️', '🌟', '🎉', '🏆'];
            const illustration = illustrations[index % illustrations.length];

            pages.push({
                title: `Chapter ${index + 1}`,
                content: transformedSentence + ".",
                illustration: illustration
            });
        });

        pages.push({
            title: "The End of My Adventure! 🎉",
            content: "I finished my doctor visit and felt proud of how brave I was. The health heroes helped me stay strong and healthy. What an amazing adventure!",
            illustration: "🏆🌟🎉"
        });

        return pages;
    }

    displayStorybook() {
        if (this.processingSection) this.processingSection.style.display = 'none';
        if (this.storybookSection) this.storybookSection.style.display = 'block';
        
        this.renderStoryPages();
        this.currentPage = 0;
        this.showCurrentPage();
    }

    renderStoryPages() {
        if (!this.storybookPages) return;
        
        this.storybookPages.innerHTML = '';
        
        this.storyPages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'story-page';
            
            let illustrationHTML;
            if (page.illustration && page.illustration.startsWith('http')) {
                illustrationHTML = `<img src="${page.illustration}" alt="${page.title}" class="story-image" />`;
            } else {
                illustrationHTML = `<div class="story-emoji">${page.illustration}</div>`;
            }
            
            pageElement.innerHTML = `
                <div class="page-number">Page ${index + 1}</div>
                <div class="story-content">
                    <h3 class="story-title">${page.title}</h3>
                    <div class="story-illustration">${illustrationHTML}</div>
                    <p class="story-text">${page.content}</p>
                </div>
            `;
            this.storybookPages.appendChild(pageElement);
        });
    }

    showCurrentPage() {
        if (!this.storybookPages) return;
        
        const pages = this.storybookPages.querySelectorAll('.story-page');
        pages.forEach((page, index) => {
            page.classList.toggle('active', index === this.currentPage);
        });

        if (this.pageCounter) {
            this.pageCounter.textContent = `Page ${this.currentPage + 1} of ${this.storyPages.length}`;
        }
        if (this.prevPageBtn) this.prevPageBtn.disabled = this.currentPage === 0;
        if (this.nextPageBtn) this.nextPageBtn.disabled = this.currentPage === this.storyPages.length - 1;
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showCurrentPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.storyPages.length - 1) {
            this.currentPage++;
            this.showCurrentPage();
        }
    }

    saveStory() {
        const storyData = {
            title: "My Doctor Visit Story",
            date: new Date().toLocaleDateString(),
            pages: this.storyPages
        };

        // Save to localStorage for the storybook viewer
        let savedStories = [];
        const existingStories = localStorage.getItem('doctorVisitStories');
        if (existingStories) {
            savedStories = JSON.parse(existingStories);
        }
        
        savedStories.push(storyData);
        localStorage.setItem('doctorVisitStories', JSON.stringify(savedStories));
        
        console.log('Story saved to localStorage:', storyData);

        // Also create downloadable file
        const dataStr = JSON.stringify(storyData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `doctor-visit-story-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Your story has been saved! 📚✨');
    }

    shareStory() {
        if (navigator.share) {
            const storyText = this.storyPages.map(page => `${page.title}\n${page.content}`).join('\n\n');
            navigator.share({
                title: 'My Doctor Visit Story',
                text: storyText
            });
        } else {
            const storyText = this.storyPages.map(page => `${page.title}\n${page.content}`).join('\n\n');
            navigator.clipboard.writeText(storyText).then(() => {
                this.showSuccess('Story copied to clipboard! You can paste it anywhere to share! 📋✨');
            });
        }
    }

    startJourney() {
        if (this.designLayout) this.designLayout.style.display = 'none';
        if (this.functionalInterface) this.functionalInterface.style.display = 'block';
        if (this.recordingSection) this.recordingSection.style.display = 'block';
    }

    createNewStory() {
        console.log('Creating new story...');
        
        this.currentPage = 0;
        this.storyPages = [];
        this.transcribedText = '';
        this.audioChunks = [];
        this.isRecording = false;
        
        if (this.designLayout && this.functionalInterface) {
            this.designLayout.style.display = 'flex';
            this.functionalInterface.style.display = 'none';
        } else {
            if (this.storybookSection) this.storybookSection.style.display = 'none';
            if (this.processingSection) this.processingSection.style.display = 'none';
            if (this.recordingSection) this.recordingSection.style.display = 'block';
        }
        
        if (this.audioPreview) this.audioPreview.style.display = 'none';
        if (this.statusText) this.statusText.textContent = 'Ready to record your new story!';
        if (this.recordBtn) {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<span class="mic-icon">🎤</span><span class="btn-text">Start Recording</span>';
        }
        if (this.pulseAnimation) this.pulseAnimation.style.display = 'none';
        
        console.log('New story setup complete');
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #66bb6a, #81c784);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 4000);
    }
}

// Test microphone availability
function testMicrophoneAccess() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not supported');
        return false;
    }
    console.log('MediaDevices API supported');
    return true;
}

// Add slide-in animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, testing microphone access...');
    testMicrophoneAccess();
    
    console.log('Initializing DoctorStorybookApp...');
    const app = new DoctorStorybookApp();
    console.log('App initialized:', app);
    
    // Make app globally accessible for debugging
    window.storybookApp = app;
});

// Listen for AI ready event
document.addEventListener('aiReady', (event) => {
    console.log('🎉 AI Ready event received!', event.detail);
});

// Verify AI is loaded when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, verifying AI availability...');
    
    // Detailed debugging
    console.log('🔍 window.aiStoryGenerator exists:', !!window.aiStoryGenerator);
    console.log('🔍 window.AI_READY flag:', window.AI_READY);
    console.log('🔍 CLAUDE_API_CONFIG exists:', typeof CLAUDE_API_CONFIG !== 'undefined');
    console.log('🔍 AIStoryGenerator class exists:', typeof AIStoryGenerator !== 'undefined');
    
    // Check if claude-ai.js loaded properly
    if (typeof CLAUDE_API_CONFIG === 'undefined') {
        console.error('❌ CLAUDE_API_CONFIG not found - claude-ai.js script tag missing or failed to load!');
        console.error('📋 Check: 1) Is claude-ai.js in the right folder? 2) Is the script tag correct?');
        return;
    }
    
    if (typeof AIStoryGenerator === 'undefined') {
        console.error('❌ AIStoryGenerator class not found - JavaScript error in claude-ai.js!');
        return;
    }
    
    // Check if AI instance exists
    if (window.aiStoryGenerator && window.AI_READY) {
        console.log('✅ AI Story Generator is ready and working!');
        console.log('🔍 AI methods:', typeof window.aiStoryGenerator.generateKidFriendlyStory);
    } else {
        console.log('⚠️ AI Story Generator not ready yet - waiting...');
        console.log('🔍 aiStoryGenerator exists:', !!window.aiStoryGenerator);
        console.log('🔍 AI_READY flag:', window.AI_READY);
        
        // Wait and check again
        let attempts = 0;
        const checkAI = () => {
            attempts++;
            if (window.aiStoryGenerator && window.AI_READY) {
                console.log('✅ AI Story Generator is now ready after', attempts, 'attempts!');
                return;
            }
            if (attempts < 10) {
                setTimeout(checkAI, 200);
            } else {
                console.error('❌ AI Story Generator failed to initialize after 2 seconds');
                console.error('🔍 Final check - aiStoryGenerator:', !!window.aiStoryGenerator);
                console.error('🔍 Final check - AI_READY:', window.AI_READY);
            }
        };
        setTimeout(checkAI, 100);
    }
});