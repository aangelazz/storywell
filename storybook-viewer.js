// storybook-viewer.js

class StorybookViewer {
    constructor() {
      this.stories = [];
      this.currentStory = null;
      this.currentPage = 0;
  
      // Elements for library page (storybook.html)
      this.storiesList = document.getElementById('storiesList');
      this.storiesGrid = document.getElementById('storiesGrid');
  
      // Elements for reader page (storybook-view.html)
      this.storyViewer = document.getElementById('storyViewer');
      this.storyTitle = document.getElementById('storyTitle');
      this.storybookPages = document.getElementById('storybookPages');
      this.prevPageBtn = document.getElementById('prevPageBtn');
      this.nextPageBtn = document.getElementById('nextPageBtn');
      this.pageCounter = document.getElementById('pageCounter');
      this.shareStoryBtn = document.getElementById('shareStoryBtn');
      this.deleteStoryBtn = document.getElementById('deleteStoryBtn');
    }
  
    // ======================
    // LIBRARY PAGE FUNCTIONS
    // ======================
  
    loadStories() {
      const savedStories = localStorage.getItem('doctorVisitStories');
      this.stories = savedStories ? JSON.parse(savedStories) : [];
    }
  
    displayStoriesList() {
      if (!this.storiesGrid) return; // Only run on library page
  
      if (this.stories.length === 0) {
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
        return;
      }
  
      const storiesHTML = this.stories.map((story, index) => `
        <div class="story-card" onclick="window.location.href='storybook-view.html?id=${index}'">
          <div class="story-card-header">
            <h3>${story.title}</h3>
            <span class="story-date">${story.date}</span>
          </div>
          <div class="story-preview">
            <div class="story-preview-image">📖</div>
            <p class="story-preview-text">
              ${story.pages[1]?.content?.substring(0, 100) || 'Your doctor visit story...'}...
            </p>
          </div>
          <div class="story-stats">${story.pages.length} pages</div>
        </div>
      `).join('');
  
      this.storiesGrid.innerHTML = storiesHTML;
    }
  
    loadStoryById(id) {
      if (id < 0 || id >= this.stories.length) return;
      this.currentStory = this.stories[id];
      this.currentPage = 0;
      this.renderStory();
    }
  
    renderStory() {
      if (!this.currentStory || !this.storybookPages) return;
  
      this.storyTitle.textContent = this.currentStory.title;
      this.storybookPages.innerHTML = '';
  
      this.currentStory.pages.forEach((page, index) => {
        const pageElement = document.createElement('div');
        pageElement.className = 'story-page';
        pageElement.innerHTML = `
          <div class="page-number">Page ${index + 1}</div>
          <div class="story-content">
            <h3 class="story-title">${page.title}</h3>
            <div class="story-illustration">
              ${page.illustration?.startsWith('http') 
                ? `<img src="${page.illustration}" alt="${page.title}" class="story-image" />`
                : `<div class="story-emoji">${page.illustration || '📖'}</div>`}
            </div>
            <p class="story-text">${page.content}</p>
          </div>
        `;
        this.storybookPages.appendChild(pageElement);
      });
  
      this.showCurrentPage();
      this.setupReaderControls();
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
  
    setupReaderControls() {
      this.prevPageBtn.onclick = () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.showCurrentPage();
        }
      };
  
      this.nextPageBtn.onclick = () => {
        if (this.currentPage < this.currentStory.pages.length - 1) {
          this.currentPage++;
          this.showCurrentPage();
        }
      };
  
      this.shareStoryBtn.onclick = () => this.shareStory();
      this.deleteStoryBtn.onclick = () => this.deleteStory();
    }
  
    shareStory() {
      if (!this.currentStory) return;
  
      const storyText = this.currentStory.pages.map(
        page => `${page.title}\n${page.content}`
      ).join('\n\n');
  
      if (navigator.share) {
        navigator.share({
          title: this.currentStory.title,
          text: storyText
        });
      } else {
        navigator.clipboard.writeText(storyText).then(() => {
          alert("Story copied to clipboard! 📋✨");
        });
      }
    }
  
    deleteStory() {
      if (!this.currentStory) return;
      if (!confirm("Are you sure you want to delete this story?")) return;
  
      const index = this.stories.indexOf(this.currentStory);
      this.stories.splice(index, 1);
  
      localStorage.setItem('doctorVisitStories', JSON.stringify(this.stories));
      alert("Story deleted successfully!");
      window.location.href = 'storybook.html';
    }
  }
  
  // ======================
  // INIT
  // ======================
  
  document.addEventListener('DOMContentLoaded', () => {
    const viewer = new StorybookViewer();
    viewer.loadStories();
  
    // If we're on storybook.html (library)
    if (viewer.storiesGrid) {
      viewer.displayStoriesList();
    }
  
    // If we're on storybook-view.html (reader)
    const params = new URLSearchParams(window.location.search);
    const storyId = parseInt(params.get('id'));
    if (!isNaN(storyId) && viewer.storybookPages) {
      viewer.loadStoryById(storyId);
    }
  });