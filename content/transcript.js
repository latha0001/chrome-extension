/**
 * Transcript extractor module
 * Responsible for finding and extracting YouTube transcript data
 */
class TranscriptExtractor {
  constructor() {
    this.transcript = [];
    this.isTranscriptAvailable = false;
  }

  /**
   * Initialize the transcript extractor
   */
  async init() {
    try {
      // Try to extract transcript through YouTube's API data
      await this.extractTranscript();
    } catch (error) {
      console.error('Error extracting transcript:', error);
    }
  }

  /**
   * Extract transcript data from YouTube page
   */
  async extractTranscript() {
    // Wait for page to fully load
    await this.waitForVideoPlayer();
    
    // First approach: Extract from ytInitialPlayerResponse
    try {
      const scriptElements = Array.from(document.querySelectorAll('script'));
      
      for (const script of scriptElements) {
        if (script.textContent.includes('ytInitialPlayerResponse')) {
          const textContent = script.textContent;
          const startIndex = textContent.indexOf('ytInitialPlayerResponse');
          if (startIndex > -1) {
            const jsonStart = textContent.indexOf('{', startIndex);
            const jsonEnd = this.findMatchingBracket(textContent, jsonStart);
            
            if (jsonStart > -1 && jsonEnd > -1) {
              const jsonStr = textContent.substring(jsonStart, jsonEnd + 1);
              const data = JSON.parse(jsonStr);
              
              // Navigate to transcript data
              if (data?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                const captionTracks = data.captions.playerCaptionsTracklistRenderer.captionTracks;
                if (captionTracks && captionTracks.length > 0) {
                  await this.fetchTranscriptFromUrl(captionTracks[0].baseUrl);
                  return;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting transcript from initial data:', error);
    }
    
    // Second approach: Find and click the transcript button
    try {
      await this.extractTranscriptUsingUI();
    } catch (error) {
      console.error('Error extracting transcript using UI:', error);
      this.isTranscriptAvailable = false;
    }
  }

  /**
   * Wait for video player to be available
   */
  waitForVideoPlayer() {
    return new Promise((resolve) => {
      const checkForPlayer = () => {
        if (document.querySelector('#movie_player')) {
          resolve();
        } else {
          setTimeout(checkForPlayer, 200);
        }
      };
      
      checkForPlayer();
    });
  }

  /**
   * Find matching closing bracket
   */
  findMatchingBracket(text, openBracketIndex) {
    let depth = 1;
    for (let i = openBracketIndex + 1; i < text.length; i++) {
      if (text[i] === '{') {
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Fetch transcript from YouTube's transcript URL
   */
  async fetchTranscriptFromUrl(url) {
    try {
      const response = await fetch(url);
      const xml = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      
      const textElements = xmlDoc.getElementsByTagName('text');
      this.transcript = [];
      
      for (let i = 0; i < textElements.length; i++) {
        const text = textElements[i].textContent;
        const start = parseFloat(textElements[i].getAttribute('start'));
        const duration = parseFloat(textElements[i].getAttribute('dur') || '0');
        
        if (text && text.trim()) {
          this.transcript.push({
            text: text.trim(),
            start,
            duration
          });
        }
      }
      
      this.isTranscriptAvailable = this.transcript.length > 0;
    } catch (error) {
      console.error('Error fetching transcript from URL:', error);
      this.isTranscriptAvailable = false;
    }
  }

  /**
   * Extract transcript by simulating UI interactions
   */
  async extractTranscriptUsingUI() {
    // This is a fallback method - find the "..." button, click it, then find "Show transcript"
    // Implementation will depend on YouTube's current UI structure
    // This is complex and prone to breaking with YouTube UI changes
    
    // For now, we'll consider it not implemented
    throw new Error('UI-based transcript extraction not implemented');
  }

  /**
   * Get the full transcript as text
   */
  getFullTranscript() {
    if (!this.isTranscriptAvailable) {
      return '';
    }
    
    return this.transcript.map(item => item.text).join(' ');
  }

  /**
   * Get the transcript as an array of segments
   */
  getTranscriptSegments() {
    return this.transcript;
  }

  /**
   * Check if transcript is available
   */
  hasTranscript() {
    return this.isTranscriptAvailable;
  }
}

// Export for use in other modules
window.TranscriptExtractor = TranscriptExtractor;