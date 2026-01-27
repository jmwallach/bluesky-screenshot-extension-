// options.js - Settings page functionality

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const identifierInput = document.getElementById('identifier');
  const passwordInput = document.getElementById('password');
  const testButton = document.getElementById('testButton');
  const statusMessage = document.getElementById('statusMessage');

  // Load saved settings
  loadSettings();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings();
  });

  // Handle test connection
  testButton.addEventListener('click', async () => {
    await testConnection();
  });

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      if (blueskyIdentifier) {
        identifierInput.value = blueskyIdentifier;
      }

      if (blueskyPassword) {
        passwordInput.value = blueskyPassword;
      }
    } catch (error) {
      showStatus('Failed to load settings', 'error');
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        blueskyIdentifier: identifier,
        blueskyPassword: password,
      });

      showStatus('Settings saved successfully! ✓', 'success');

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        hideStatus();
      }, 3000);
    } catch (error) {
      showStatus('Failed to save settings: ' + error.message, 'error');
    }
  }

  /**
   * Test Bluesky connection
   */
  async function testConnection() {
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
      showStatus('Please fill in all fields first', 'error');
      return;
    }

    // Disable button and show loading state
    testButton.disabled = true;
    testButton.textContent = 'Testing...';

    try {
      const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials. Please check your handle/email and app password.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(`Connection failed (${response.status}). Please try again.`);
        }
      }

      const data = await response.json();

      if (data.accessJwt) {
        showStatus('✓ Connection successful! Your credentials are valid.', 'success');
      } else {
        throw new Error('Unexpected response from Bluesky.');
      }
    } catch (error) {
      if (error.message.includes('fetch')) {
        showStatus('Network error. Please check your internet connection.', 'error');
      } else {
        showStatus('Test failed: ' + error.message, 'error');
      }
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'Test Connection';
    }
  }

  /**
   * Show status message
   */
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
  }

  /**
   * Hide status message
   */
  function hideStatus() {
    statusMessage.style.display = 'none';
  }
});
