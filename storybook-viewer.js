class StorybookViewer {
    constructor() {
        this.currentStory = null;
        this.currentPage = 0;
        this.stories = [];
        
        this.initializeElements();
        this.loadSavedStories();
        this.setupEventListeners();
    }

    initializeElements() {
        this.storiesList = document.getElementById('storiesList');
        this.storyViewer = document.getElementById('storyViewer');
        this.storiesGrid = document.getElementById('storiesGrid');
        this.storybookPages = document.getElementById('storybookPages');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.pageCounter = document.getElementById('pageCounter');
        this.storyTitle = document.getElementById('storyTitle');
        this.shareStoryBtn = document.getElementById('shareStoryBtn');
        this.deleteStoryBtn = document.getElementById('deleteStoryBtn');
    }

    setupEventListeners() {
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
        this.shareStoryBtn.addEventListener('click', () => this.shareStory());
        this.deleteStoryBtn.addEventListener('click', () => this.deleteStory());
    }

    loadSavedStories() {
        // Load stories from localStorage
        const savedStories = localStorage.getItem('doctorVisitStories');
        if (savedStories) {
            this.stories = JSON.parse(savedStories);
            this.displayStoriesList();
        } else {
            this.displayEmptyState();
        }
    }

    displayStoriesList() {
        if (this.stories.length === 0) {
            this.displayEmptyState();
            return;
        }

        const storiesHTML = this.stories.map((story, index) => `
            <div class="story-card" onclick="viewStory(${index})">
                <div class="story-card-header">
                    <h3>${story.title}</h3>
                    <span class="story-date">${story.date}</span>
                </div>
                <div class="story-preview">
                    <div class="story-preview-image">📖</div>
                    <p class="story-preview-text">${story.pages[1]?.content?.substring(0, 100) || 'Your doctor visit story...'}...</p>
                </div>
                <div class="story-stats">
                    ${story.pages.length} pages
                </div>
            </div>
        `).join('');

        this.storiesGrid.innerHTML = storiesHTML;
    }

    displayEmptyState() {
        this.storiesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No stories yet!</h3>
                <p>Create your first story by recording about your doctor visit.</p>
                <button class="create-story-btn" onclick="window.location.href='app.html'">
                    🎤 Create Your First Story
                </button>
            </div>
        `;
    }

    viewStory(index) {
        this.currentStory = this.stories[index];
        this.currentPage = 0;
        
        this.storiesList.style.display = 'none';
        this.storyViewer.style.display = 'block';
        
        this.storyTitle.textContent = this.currentStory.title;
        this.renderStoryPages();
        this.showCurrentPage();
    }

    renderStoryPages() {
        this.storybookPages.innerHTML = '';
        
        this.currentStory.pages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'story-page';
            
            // Handle both image URLs and emoji illustrations
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
        const pages = this.storybookPages.querySelectorAll('.story-page');
        pages.forEach((page, index) => {
            page.classList.toggle('active', index === this.currentPage);
        });

        this.pageCounter.textContent = `Page ${this.currentPage + 1} of ${this.currentStory.pages.length}`;
        this.prevPageBtn.disabled = this.currentPage === 0;
        this.nextPageBtn.disabled = this.currentPage === this.currentStory.pages.length - 1;
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showCurrentPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.currentStory.pages.length - 1) {
            this.currentPage++;
            this.showCurrentPage();
        }
    }

    shareStory() {
        if (navigator.share) {
            const storyText = this.currentStory.pages.map(page => `${page.title}\n${page.content}`).join('\n\n');
            navigator.share({
                title: this.currentStory.title,
                text: storyText
            });
        } else {
            // Fallback: copy to clipboard
            const storyText = this.currentStory.pages.map(page => `${page.title}\n${page.content}`).join('\n\n');
            navigator.clipboard.writeText(storyText).then(() => {
                this.showSuccess('Story copied to clipboard! You can paste it anywhere to share! 📋✨');
            });
        }
    }

    deleteStory() {
        if (confirm('Are you sure you want to delete this story? This cannot be undone.')) {
            const storyIndex = this.stories.indexOf(this.currentStory);
            this.stories.splice(storyIndex, 1);
            
            // Update localStorage
            localStorage.setItem('doctorVisitStories', JSON.stringify(this.stories));
            
            this.showSuccess('Story deleted successfully!');
            this.showStoriesList();
        }
    }

    showStoriesList() {
        this.storyViewer.style.display = 'none';
        this.storiesList.style.display = 'block';
        this.loadSavedStories();
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
}

// Global functions for HTML onclick events
function viewStory(index) {
    storybookViewer.viewStory(index);
}

function showStoriesList() {
    storybookViewer.showStoriesList();
}

// Initialize the storybook viewer when the page loads
let storybookViewer;
document.addEventListener('DOMContentLoaded', () => {
    storybookViewer = new StorybookViewer();
});