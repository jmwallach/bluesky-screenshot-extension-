// popup.js - Popup functionality

document.addEventListener('DOMContentLoaded', async () => {
  const statusIndicator = document.getElementById('statusIndicator');
  const settingsButton = document.getElementById('settingsButton');
  const closeButton = document.getElementById('closeButton');

  // Check if credentials are configured
  await checkConfiguration();

  // Handle settings button
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // Handle close button
  closeButton.addEventListener('click', () => {
    window.close();
  });

  /**
   * Check if extension is configured
   */
  async function checkConfiguration() {
    try {
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      if (blueskyIdentifier && blueskyPassword) {
        statusIndicator.textContent = '✓ Configured & Ready';
        statusIndicator.className = 'status configured';
      } else {
        statusIndicator.textContent = '⚙️ Setup Required';
        statusIndicator.className = 'status not-configured';
      }
    } catch (error) {
      console.error('Failed to check configuration:', error);
      statusIndicator.textContent = '⚠️ Error checking status';
      statusIndicator.className = 'status not-configured';
    }
  }
});
