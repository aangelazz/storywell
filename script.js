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
        // New layout elements
        this.startRecordingBtn = document.querySelector('.start-recording-btn');
        this.functionalInterface = document.getElementById('functionalInterface');
        this.designLayout = document.querySelector('.design-layout');
        
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
            // Request microphone permission
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
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            console.log('MediaRecorder started');
            
            // Start speech recognition if available
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
            this.statusText.textContent = 'Recording... Tell me about your doctor visit!';
            this.pulseAnimation.style.display = 'block';
        } else {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<span class="mic-icon">🎤</span><span class="btn-text">Start Recording</span>';
            this.statusText.textContent = 'Recording finished! Listen to your recording below.';
            this.pulseAnimation.style.display = 'none';
        }
    }

    retryRecording() {
        this.audioPreview.style.display = 'none';
        this.transcribedText = '';
        this.statusText.textContent = 'Ready to record again!';
    }

    async processAudio() {
        this.showProcessingSection();
        await this.simulateProcessingSteps();
      
        const storyText = this.transcribedText.trim() || this.getSampleStoryText();
      
        try {
          const response = await fetch("https://api.dedalus.ai/v1/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer dsk_live_a1558a05cea5_fe8d50293a3e6b84059040513fb21f8e"
            },
            body: JSON.stringify({
              prompt: `Turn this doctor's visit transcript into a children's storybook with multiple pages, 
                       each with a title, content, and emoji illustration. Format as JSON.`,
              input: storyText,
              max_tokens: 800
            })
          });
      
          const data = await response.json();
      
          if (data.pages) {
            this.storyPages = data.pages;
          } else {
            console.warn("Dedalus API did not return structured pages, falling back.");
            this.storyPages = this.createStoryPages(storyText);
          }
      
          this.displayStorybook();
      
        } catch (err) {
          console.error("Dedalus API error:", err);
          this.storyPages = this.createStoryPages(storyText); // fallback
          this.displayStorybook();
        }
      }

    showProcessingSection() {
        this.recordingSection.style.display = 'none';
        this.processingSection.style.display = 'block';
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
            this.processingText.textContent = steps[i];
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    generateStorybook() {
        // Use transcribed text if available, otherwise use sample text
        const storyText = this.transcribedText.trim() || this.getSampleStoryText();
        
        // Transform medical text into kid-friendly story
        this.storyPages = this.createStoryPages(storyText);
        
        // Display the storybook
        this.displayStorybook();
    }

    getSampleStoryText() {
        return "I went to see Dr. Smith today for my checkup. She checked my height and weight. Then she listened to my heart with a stethoscope. She looked in my ears and throat with a special light. She said I was growing well and was very healthy. She gave me a sticker for being brave.";
    }

    createStoryPages(text) {
        // Simple story transformation logic
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const pages = [];

        // Title page
        pages.push({
            title: "My Amazing Doctor Visit Adventure! 🏥",
            content: "Today I went on a special adventure to visit my doctor. Let me tell you all about it!",
            illustration: "🏥👨‍⚕️👩‍⚕️"
        });

        // Transform medical terms to kid-friendly language
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

        // Process each sentence
        sentences.forEach((sentence, index) => {
            let transformedSentence = sentence.trim();
            
            // Apply transformations
            Object.keys(transformations).forEach(medical => {
                const friendly = transformations[medical];
                const regex = new RegExp(medical, 'gi');
                transformedSentence = transformedSentence.replace(regex, friendly);
            });

            // Add encouraging language
            if (transformedSentence.toLowerCase().includes('brave') || 
                transformedSentence.toLowerCase().includes('good')) {
                transformedSentence += " I was such a brave little hero! 🦸‍♂️";
            }

            // Create page with illustration
            const illustrations = ['🩺', '📏', '⚖️', '👂', '👄', '❤️', '🌟', '🎉', '🏆'];
            const illustration = illustrations[index % illustrations.length];

            pages.push({
                title: `Chapter ${index + 1}`,
                content: transformedSentence + ".",
                illustration: illustration
            });
        });

        // Ending page
        pages.push({
            title: "The End of My Adventure! 🎉",
            content: "I finished my doctor visit and felt proud of how brave I was. The health heroes helped me stay strong and healthy. What an amazing adventure!",
            illustration: "🏆🌟🎉"
        });

        return pages;
    }

    displayStorybook() {
        this.processingSection.style.display = 'none';
        this.storybookSection.style.display = 'block';
        
        this.renderStoryPages();
        this.currentPage = 0;
        this.showCurrentPage();
    }

    renderStoryPages() {
        this.storybookPages.innerHTML = '';
        
        this.storyPages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'story-page';
            pageElement.innerHTML = `
                <div class="page-number">Page ${index + 1}</div>
                <div class="story-content">
                    <h3 class="story-title">${page.title}</h3>
                    <div class="story-illustration">${page.illustration}</div>
                    <p class="story-text">${page.content}</p>
                </div>
            `;
            this.storybookPages.appendChild(pageElement);
        });
    }

    showCurrentPage() {
        const pages = this.storybookPages.querySelectorAll('.story-page');
        pages.forEach((page, index) => {
            page.classList.toggle('active', index === this.currentPage);
        });

        this.pageCounter.textContent = `Page ${this.currentPage + 1} of ${this.storyPages.length}`;
        this.prevPageBtn.disabled = this.currentPage === 0;
        this.nextPageBtn.disabled = this.currentPage === this.storyPages.length - 1;
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
            // Fallback: copy to clipboard
            const storyText = this.storyPages.map(page => `${page.title}\n${page.content}`).join('\n\n');
            navigator.clipboard.writeText(storyText).then(() => {
                this.showSuccess('Story copied to clipboard! You can paste it anywhere to share! 📋✨');
            });
        }
    }

    startJourney() {
        // Hide the design layout and show functional interface (for index.html)
        if (this.designLayout) this.designLayout.style.display = 'none';
        if (this.functionalInterface) this.functionalInterface.style.display = 'block';
        if (this.recordingSection) this.recordingSection.style.display = 'block';
    }

    createNewStory() {
        // Reset the application
        this.currentPage = 0;
        this.storyPages = [];
        this.transcribedText = '';
        this.audioChunks = [];
        
        // Show design layout and hide functional interface
        this.designLayout.style.display = 'flex';
        this.functionalInterface.style.display = 'none';
        this.storybookSection.style.display = 'none';
        this.audioPreview.style.display = 'none';
        
        // Reset UI
        this.statusText.textContent = 'Ready to record your new story!';
        this.recordBtn.classList.remove('recording');
        this.recordBtn.innerHTML = '<span class="mic-icon">🎤</span><span class="btn-text">Start Recording</span>';
    }

    showSuccess(message) {
        // Create a temporary success message
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
        // Create a temporary error message
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

    initializeHomePage() {
        // Setup event listeners and UI for the home page
        this.startRecordingBtn.addEventListener('click', () => this.startJourney());
    }

    initializeStorybookPage() {
        // Setup event listeners and UI for the storybook page
        this.renderStoryPages();
        this.currentPage = 0;
        this.showCurrentPage();

        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
        this.saveStoryBtn.addEventListener('click', () => this.saveStory());
        this.newStoryBtn.addEventListener('click', () => this.createNewStory());
        this.shareStoryBtn.addEventListener('click', () => this.shareStory());
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, testing microphone access...');
    testMicrophoneAccess();
    
    console.log('Initializing DoctorStorybookApp...');
    const app = new DoctorStorybookApp();
    console.log('App initialized:', app);
    
    // Make app globally accessible for debugging
    window.storybookApp = app;

    const currentPage = window.location.pathname;

    if (currentPage.includes('index.html') || currentPage === '/') {
        app.initializeHomePage(); // Initialize home page functionality
    } else if (currentPage.includes('storybook.html')) {
        app.initializeStorybookPage(); // Initialize storybook functionality
    }
});

