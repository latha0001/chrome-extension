document.addEventListener('DOMContentLoaded', async () => {
  const aiPlatformRadios = document.querySelectorAll('input[name="ai-platform"]');
  const customPromptTextarea = document.getElementById('custom-prompt');
  const saveButton = document.getElementById('save-settings');
  
  // Load saved settings
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
  
  // Save settings
  saveButton.addEventListener('click', async () => {
    const selectedPlatform = document.querySelector('input[name="ai-platform"]:checked').value;
    const customPrompt = customPromptTextarea.value.trim();
    
    if (!customPrompt) {
      alert('Please enter a custom prompt');
      return;
    }
    
    await chrome.storage.local.set({
      aiPlatform: selectedPlatform,
      customPrompt: customPrompt
    });
    
    // Provide feedback
    saveButton.textContent = 'Saved!';
    saveButton.style.backgroundColor = 'var(--success-color)';
    
    setTimeout(() => {
      saveButton.textContent = 'Save Settings';
      saveButton.style.backgroundColor = '';
    }, 1500);
  });
});