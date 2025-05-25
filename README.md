# YouTube Transcript Summarizer

A Chrome extension that enhances the YouTube experience by showing video transcripts and allowing users to summarize content via their preferred AI platform.

## Features

- Extract and display the YouTube video transcript in a sidebar
- "Summarize" button integrated near the YouTube video controls
- Support for multiple AI platforms (ChatGPT, Gemini, Claude)
- Custom prompt configuration
- Copy transcript functionality
- Error handling for unavailable transcripts

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

## Usage

1. Navigate to a YouTube video
2. Click the "Transcript" button in the YouTube player controls
3. View the transcript in the sidebar
4. Click "Summarize with AI" to send the transcript to your preferred AI platform
5. On first use, you'll be prompted to select your preferred AI platform and customize your prompt
6. Settings can be updated by clicking the extension icon in your browser toolbar

## Development

### Project Structure

```
extension/
├── manifest.json        # Extension configuration
├── popup/               # Popup UI when clicking extension icon
├── content/             # Scripts injected into YouTube pages
├── options/             # Options page for settings
└── assets/              # Icons and assets
```

### Building for Production

This extension can be loaded directly as an unpacked extension for development. For production distribution to the Chrome Web Store, you may want to:

1. Remove any console logs
2. Optimize images
3. Minify CSS and JavaScript files
