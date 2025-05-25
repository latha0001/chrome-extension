/**
 * UI manager module
 * Responsible for creating and managing the extension's UI elements
 */
class UIManager {
  constructor(transcriptExtractor) {
    this.transcriptExtractor = transcriptExtractor;
    this.sidebarVisible = false;
    this.sidebar = null;
    this.summarizeButton = null;
    this.transcriptContainer = null;
  }

  /**
   * Initialize the UI manager
   */
  init() {
    this.createSummarizeButton();
    this.createSidebar();
    this.setupEventListeners();
  }

  /**
   * Create and inject the summarize button
   */
  createSummarizeButton() {
    // Look for the YouTube controls container
    const controlsContainer = document.querySelector('.ytp-right-controls');
    if (!controlsContainer) {
      console.error('Could not find YouTube controls container');
      return;
    }

    // Create summarize button
    this.summarizeButton = document.createElement('button');
    this.summarizeButton.className = 'yts-summarize-btn';
    this.summarizeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="yts-icon">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    `;
    this.summarizeButton.title = 'Show Transcript & Summarize';
    
    // Insert the button in the controls
    controlsContainer.insertBefore(this.summarizeButton, controlsContainer.firstChild);
  }

  /**
   * Create the transcript sidebar
   */
  createSidebar() {
    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'yts-sidebar';
    this.sidebar.classList.add('yts-sidebar-hidden');
    
    // Create sidebar header
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'yts-sidebar-header';
    
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = 'Video Transcript';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'yts-close-btn';
    closeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeButton.title = 'Close Transcript';
    
    sidebarHeader.appendChild(headerTitle);
    sidebarHeader.appendChild(closeButton);
    
    // Create actions bar
    const actionsBar = document.createElement('div');
    actionsBar.className = 'yts-actions-bar';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'yts-action-btn yts-copy-btn';
    copyButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Copy Transcript</span>
    `;
    
    const summarizeActionButton = document.createElement('button');
    summarizeActionButton.className = 'yts-action-btn yts-summarize-action-btn';
    summarizeActionButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>Summarize with AI</span>
    `;
    
    actionsBar.appendChild(copyButton);
    actionsBar.appendChild(summarizeActionButton);
    
    // Create transcript container
    this.transcriptContainer = document.createElement('div');
    this.transcriptContainer.className = 'yts-transcript-container';
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'yts-loading';
    loadingIndicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="yts-spinner">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      <p>Loading transcript...</p>
    `;
    
    // Error message for when transcript is unavailable
    const errorMessage = document.createElement('div');
    errorMessage.className = 'yts-error-message';
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>Transcript unavailable for this video.</p>
    `;
    
    // Assemble sidebar
    this.transcriptContainer.appendChild(loadingIndicator);
    this.transcriptContainer.appendChild(errorMessage);
    
    this.sidebar.appendChild(sidebarHeader);
    this.sidebar.appendChild(actionsBar);
    this.sidebar.appendChild(this.transcriptContainer);
    
    // Add sidebar to page
    document.body.appendChild(this.sidebar);
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Summarize button click
    this.summarizeButton.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // Close button click
    const closeButton = this.sidebar.querySelector('.yts-close-btn');
    closeButton.addEventListener('click', () => {
      this.hideSidebar();
    });
    
    // Copy transcript button
    const copyButton = this.sidebar.querySelector('.yts-copy-btn');
    copyButton.addEventListener('click', () => {
      this.copyTranscript();
    });
    
    // Summarize action button
    const summarizeActionButton = this.sidebar.querySelector('.yts-summarize-action-btn');
    summarizeActionButton.addEventListener('click', () => {
      window.youtubeTranscriptSummarizer.summarizeTranscript();
    });
  }

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar() {
    if (this.sidebarVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

  /**
   * Show the sidebar and load transcript
   */
  async showSidebar() {
    this.sidebar.classList.remove('yts-sidebar-hidden');
    this.sidebarVisible = true;
    
    // Adjust video container layout
    this.adjustVideoContainer();
    
    // Show loading
    const loadingIndicator = this.transcriptContainer.querySelector('.yts-loading');
    const errorMessage = this.transcriptContainer.querySelector('.yts-error-message');
    loadingIndicator.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    // Clear any existing transcript content
    const existingTranscriptContent = this.transcriptContainer.querySelector('.yts-transcript-content');
    if (existingTranscriptContent) {
      existingTranscriptContent.remove();
    }
    
    // Wait a moment for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if transcript is available
    if (!this.transcriptExtractor.hasTranscript()) {
      // Try to extract again
      await this.transcriptExtractor.init();
    }
    
    // Display transcript or error
    if (this.transcriptExtractor.hasTranscript()) {
      this.displayTranscript();
    } else {
      loadingIndicator.style.display = 'none';
      errorMessage.style.display = 'flex';
    }
  }

  /**
   * Hide the sidebar
   */
  hideSidebar() {
    this.sidebar.classList.add('yts-sidebar-hidden');
    this.sidebarVisible = false;
    
    // Reset video container
    this.resetVideoContainer();
  }

  /**
   * Display the transcript in the sidebar
   */
  displayTranscript() {
    // Hide loading indicator
    const loadingIndicator = this.transcriptContainer.querySelector('.yts-loading');
    loadingIndicator.style.display = 'none';
    
    // Create transcript content container
    const transcriptContent = document.createElement('div');
    transcriptContent.className = 'yts-transcript-content';
    
    // Get transcript segments
    const segments = this.transcriptExtractor.getTranscriptSegments();
    
    // Create segment elements
    segments.forEach(segment => {
      const segmentElement = document.createElement('div');
      segmentElement.className = 'yts-transcript-segment';
      
      const timestamp = this.formatTimestamp(segment.start);
      segmentElement.innerHTML = `
        <span class="yts-timestamp">${timestamp}</span>
        <span class="yts-text">${segment.text}</span>
      `;
      
      // Add click event to seek to timestamp
      segmentElement.addEventListener('click', () => {
        this.seekToTimestamp(segment.start);
      });
      
      transcriptContent.appendChild(segmentElement);
    });
    
    // Add transcript content to container
    this.transcriptContainer.appendChild(transcriptContent);
  }

  /**
   * Format seconds to MM:SS format
   */
  formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Seek to a specific timestamp in the video
   */
  seekToTimestamp(seconds) {
    // Find YouTube video element
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = seconds;
    }
  }

  /**
   * Copy transcript to clipboard
   */
  copyTranscript() {
    const transcript = this.transcriptExtractor.getFullTranscript();
    
    if (transcript) {
      navigator.clipboard.writeText(transcript)
        .then(() => {
          // Show copy success feedback
          const copyButton = this.sidebar.querySelector('.yts-copy-btn');
          const originalText = copyButton.innerHTML;
          
          copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          
          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy transcript:', err);
        });
    }
  }

  /**
   * Adjust video container to make room for sidebar
   */
  adjustVideoContainer() {
    const videoContainer = document.querySelector('#primary');
    if (videoContainer) {
      videoContainer.classList.add('yts-video-container-adjusted');
    }
  }

  /**
   * Reset video container to original state
   */
  resetVideoContainer() {
    const videoContainer = document.querySelector('#primary');
    if (videoContainer) {
      videoContainer.classList.remove('yts-video-container-adjusted');
    }
  }
}

// Export for use in other modules
window.UIManager = UIManager;