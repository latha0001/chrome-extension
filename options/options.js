document.addEventListener('DOMContentLoaded', async () => {
  const aiPlatformRadios = document.querySelectorAll('input[name="ai-platform"]');
  const customPromptTextarea = document.getElementById('custom-prompt');
  const saveButton = document.getElementById('save-button');
  const statusMessage = document.getElementById('status-message');
  
  // Load saved settings
  try {
    const savedSettings = await chrome.storage.local.get(['aiPlatform', 'customPrompt']);
    
    if (savedSettings.aiPlatform) {
      const radio = document.getElementById(savedSettings.aiPlatform);
      if (radio) radio.checked = true;
    } else {
      // Default to ChatGPT if no selection saved
      document.getElementById('chatgpt').checked = true;
    }
    
    if (savedSettings.customPrompt) {
      customPromptTextarea.value = savedSettings.customPrompt;
    } else {
      // Default prompt
      customPromptTextarea.value = 'Summarize this YouTube video: [transcript]';
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings. Please try again.', false);
  }
  
  // Save settings
  saveButton.addEventListener('click', async () => {
    try {
      const selectedPlatform = document.querySelector('input[name="ai-platform"]:checked')?.value;
      const customPrompt = customPromptTextarea.value.trim();
      
      if (!selectedPlatform) {
        showStatus('Please select an AI platform.', false);
        return;
      }
      
      if (!customPrompt) {
        showStatus('Please enter a custom prompt.', false);
        return;
      }
      
      // Save to storage
      await chrome.storage.local.set({
        aiPlatform: selectedPlatform,
        customPrompt: customPrompt
      });
      
      showStatus('Settings saved successfully!', true);
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Error saving settings. Please try again.', false);
    }
  });
  
  // Show status message
  function showStatus(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    if (isSuccess) {
      statusMessage.classList.add('status-success');
    } else {
      statusMessage.classList.add('status-error');
    }
    
    // Clear message after a delay
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, 3000);
  }
});