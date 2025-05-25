/**
 * Summarizer module
 * Responsible for handling the summarization process
 */
class Summarizer {
  constructor(transcriptExtractor) {
    this.transcriptExtractor = transcriptExtractor;
    this.aiPlatform = 'chatgpt'; // Default
    this.customPrompt = 'Summarize this YouTube video: [transcript]'; // Default
  }

  /**
   * Initialize the summarizer
   */
  async init() {
    // Load user preferences from storage
    try {
      const savedSettings = await chrome.storage.local.get(['aiPlatform', 'customPrompt']);
      
      if (savedSettings.aiPlatform) {
        this.aiPlatform = savedSettings.aiPlatform;
      }
      
      if (savedSettings.customPrompt) {
        this.customPrompt = savedSettings.customPrompt;
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  /**
   * Summarize the transcript using the selected AI platform
   */
  async summarizeTranscript() {
    // Check if transcript is available
    if (!this.transcriptExtractor.hasTranscript()) {
      alert('Transcript is not available for this video.');
      return;
    }
    
    // Get transcript text
    const transcript = this.transcriptExtractor.getFullTranscript();
    if (!transcript) {
      alert('Failed to get transcript content.');
      return;
    }
    
    // Check if user has selected an AI platform
    if (!this.aiPlatform) {
      await this.showFirstTimeSetup();
      return;
    }
    
    // Prepare the prompt with the transcript
    const prompt = this.customPrompt.replace('[transcript]', transcript);
    
    // Open the selected AI platform with the prompt
    const url = this.getAiPlatformUrl(prompt);
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Show first-time setup dialog if preferences aren't set
   */
  async showFirstTimeSetup() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'yts-modal-overlay';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'yts-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="yts-modal-header">
        <h2>Set Up Your AI Summarizer</h2>
        <button class="yts-modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="yts-modal-body">
        <p>Choose your preferred AI platform for summarizing YouTube transcripts:</p>
        <div class="yts-platform-options">
          <div class="yts-platform-option">
            <input type="radio" id="modal-chatgpt" name="modal-ai-platform" value="chatgpt" checked>
            <label for="modal-chatgpt">ChatGPT</label>
          </div>
          <div class="yts-platform-option">
            <input type="radio" id="modal-gemini" name="modal-ai-platform" value="gemini">
            <label for="modal-gemini">Gemini</label>
          </div>
          <div class="yts-platform-option">
            <input type="radio" id="modal-claude" name="modal-ai-platform" value="claude">
            <label for="modal-claude">Claude</label>
          </div>
        </div>
        <div class="yts-prompt-container">
          <label for="modal-custom-prompt">Custom Summary Prompt:</label>
          <textarea id="modal-custom-prompt" placeholder="Summarize this YouTube video: [transcript]">Summarize this YouTube video: [transcript]</textarea>
          <p class="yts-prompt-info">Use [transcript] to insert the video transcript text.</p>
        </div>
      </div>
      <div class="yts-modal-footer">
        <button class="yts-modal-cancel">Cancel</button>
        <button class="yts-modal-save">Save & Summarize</button>
      </div>
    `;
    
    // Add modal to page
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Handle close button
    const closeButton = modal.querySelector('.yts-modal-close');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });
    
    // Handle cancel button
    const cancelButton = modal.querySelector('.yts-modal-cancel');
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });
    
    // Handle save button
    const saveButton = modal.querySelector('.yts-modal-save');
    saveButton.addEventListener('click', async () => {
      // Get selected platform
      const selectedPlatform = modal.querySelector('input[name="modal-ai-platform"]:checked').value;
      
      // Get custom prompt
      const customPromptInput = modal.querySelector('#modal-custom-prompt');
      const customPrompt = customPromptInput.value.trim() || 'Summarize this YouTube video: [transcript]';
      
      // Save preferences
      try {
        await chrome.storage.local.set({
          aiPlatform: selectedPlatform,
          customPrompt: customPrompt
        });
        
        // Update instance variables
        this.aiPlatform = selectedPlatform;
        this.customPrompt = customPrompt;
        
        // Remove modal
        document.body.removeChild(modalOverlay);
        
        // Proceed with summarization
        this.summarizeTranscript();
      } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences. Please try again.');
      }
    });
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
  }

  /**
   * Get the URL for the selected AI platform with the prompt
   */
  getAiPlatformUrl(prompt) {
    const encodedPrompt = encodeURIComponent(prompt);
    
    switch (this.aiPlatform) {
      case 'chatgpt':
        return `https://chat.openai.com/?q=${encodedPrompt}`;
      
      case 'gemini':
        return `https://gemini.google.com/app?text=${encodedPrompt}`;
      
      case 'claude':
        return `https://claude.ai/chat?content=${encodedPrompt}`;
      
      default:
        console.error('Unknown AI platform:', this.aiPlatform);
        return null;
    }
  }
}

// Export for use in other modules
window.Summarizer = Summarizer;