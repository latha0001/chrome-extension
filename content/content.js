/**
 * Main content script
 * Initializes and coordinates all extension components
 */
(function() {
  // Create global namespace for the extension
  window.youtubeTranscriptSummarizer = {};
  
  // Initialize components when the page is fully loaded
  window.addEventListener('load', async () => {
    console.log('YouTube Transcript Summarizer: Initializing...');
    
    try {
      // Initialize transcript extractor
      const transcriptExtractor = new TranscriptExtractor();
      await transcriptExtractor.init();
      
      // Initialize UI manager
      const uiManager = new UIManager(transcriptExtractor);
      uiManager.init();
      
      // Initialize summarizer
      const summarizer = new Summarizer(transcriptExtractor);
      await summarizer.init();
      
      // Add to global namespace
      window.youtubeTranscriptSummarizer = {
        transcriptExtractor,
        uiManager,
        summarizer,
        summarizeTranscript: () => summarizer.summarizeTranscript()
      };
      
      console.log('YouTube Transcript Summarizer: Initialization complete');
    } catch (error) {
      console.error('YouTube Transcript Summarizer: Initialization failed', error);
    }
  });
  
  // Re-initialize when navigating between YouTube videos (SPA navigation)
  let currentUrl = window.location.href;
  
  // Create observer to detect URL changes
  const observer = new MutationObserver(() => {
    if (currentUrl !== window.location.href && window.location.href.includes('youtube.com/watch')) {
      currentUrl = window.location.href;
      
      // Wait for page to load
      setTimeout(async () => {
        console.log('YouTube Transcript Summarizer: Detected navigation to new video');
        
        // Re-initialize components
        try {
          const transcriptExtractor = new TranscriptExtractor();
          await transcriptExtractor.init();
          
          // Update existing instances
          if (window.youtubeTranscriptSummarizer) {
            window.youtubeTranscriptSummarizer.transcriptExtractor = transcriptExtractor;
            
            // Hide sidebar if visible
            if (window.youtubeTranscriptSummarizer.uiManager.sidebarVisible) {
              window.youtubeTranscriptSummarizer.uiManager.hideSidebar();
            }
          }
        } catch (error) {
          console.error('YouTube Transcript Summarizer: Re-initialization failed', error);
        }
      }, 1000);
    }
  });
  
  // Start observing URL changes
  observer.observe(document, { subtree: true, childList: true });
})();