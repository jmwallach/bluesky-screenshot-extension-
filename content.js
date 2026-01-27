// content.js - Content Script

// State
let isSelectionMode = false;
let selectionOverlay = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.action === 'startSelectionMode') {
        enableSelectionMode();
        sendResponse({ success: true });
      } else if (message.action === 'captureSelection') {
        await handleCaptureSelection(message.selectedText);
        sendResponse({ success: true });
      } else if (message.action === 'cropAndPost') {
        await cropAndPost(message.dataUrl, message.region, message.selectedText);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error('Content script error:', error);
      showError(error.message ||'An error occurred. Please try again.');
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open
});

/**
 * Enable selection mode with visual feedback
 */
function enableSelectionMode() {
  if (isSelectionMode) return;

  isSelectionMode = true;

  // Show tooltip
  showTooltip('Select text and right-click to post to Bluesky');

  // Disable after 10 seconds
  setTimeout(() => {
    isSelectionMode = false;
    hideTooltip();
  }, 10000);
}

/**
 * Handle capturing the selected text and its region
 */
async function handleCaptureSelection(selectedText) {
  try {
    // Validate selection
    if (!selectedText || selectedText.trim().length === 0) {
      throw new Error('Please highlight some text first.');
    }

    if (selectedText.length > 1000) {
      throw new Error('Please select less than 1000 characters for alt text.');
    }

    // Get the bounding rectangle of the selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      throw new Error('Please try selecting the text again.');
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      throw new Error('Cannot capture an empty region. Please select visible text.');
    }

    // Add padding around the selection
    const padding = 10;
    const region = {
      x: Math.max(0, rect.left - padding + window.scrollX),
      y: Math.max(0, rect.top - padding + window.scrollY),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    // Highlight the region briefly
    highlightRegion(rect);

    // Request screenshot capture from background script
    chrome.runtime.sendMessage({
      action: 'captureScreenshot',
      region,
      selectedText: selectedText.trim(),
    });
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

/**
 * Crop the screenshot and post to Bluesky
 */
async function cropAndPost(dataUrl, region, selectedText) {
  try {
    // Create a canvas to crop the image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to process screenshot. Please try again.');
    }

    // Set canvas size to cropped region
    canvas.width = region.width * window.devicePixelRatio;
    canvas.height = region.height * window.devicePixelRatio;

    // Draw the cropped portion
    ctx.drawImage(
      img,
      region.x * window.devicePixelRatio,
      region.y * window.devicePixelRatio,
      region.width * window.devicePixelRatio,
      region.height * window.devicePixelRatio,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to data URL
    const croppedDataUrl = canvas.toDataURL('image/png');

    // Get credentials
    const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
      'blueskyIdentifier',
      'blueskyPassword',
    ]);

    // Post to Bluesky
    await postToBluesky(croppedDataUrl, selectedText, blueskyIdentifier, blueskyPassword);

    // Show success notification
    showSuccessOverlay();
  } catch (error) {
    showError(error.message || 'Failed to post to Bluesky. Please try again.');
    throw error;
  }
}

/**
 * Post to Bluesky API
 */
async function postToBluesky(imageData, altText, identifier, password) {
  // Authenticate
  const authResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!authResponse.ok) {
    if (authResponse.status === 401) {
      throw new Error('Invalid credentials. Please check your Bluesky login in settings.');
    }
    throw new Error('Authentication failed. Please try again.');
  }

  const { accessJwt } = await authResponse.json();

  // Convert data URL to blob
  const response = await fetch(imageData);
  const imageBlob = await response.blob();

  // Upload image
  const uploadResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
    method: 'POST',
    headers: {
      'Content-Type': imageBlob.type,
      Authorization: `Bearer ${accessJwt}`,
    },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    if (uploadResponse.status === 429) {
      throw new Error('Too many posts. Please wait a moment before trying again.');
    }
    throw new Error('Failed to upload image. Please try again.');
  }

  const { blob } = await uploadResponse.json();

  // Create post
  const postResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessJwt}`,
    },
    body: JSON.stringify({
      repo: identifier,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: '',
        createdAt: new Date().toISOString(),
        embed: {
          $type: 'app.bsky.embed.images',
          images: [{
            alt: altText,
            image: blob,
          }],
        },
      },
    }),
  });

  if (!postResponse.ok) {
    throw new Error('Failed to create post. Please try again.');
  }
}

/**
 * Highlight the selected region
 */
function highlightRegion(rect) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 3px solid #0085ff;
    background: rgba(0, 133, 255, 0.1);
    pointer-events: none;
    z-index: 999999;
    border-radius: 4px;
    animation: pulse 0.5s ease-in-out;
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 1000);
}

/**
 * Show tooltip for selection mode
 */
function showTooltip(message) {
  const tooltip = document.createElement('div');
  tooltip.id = 'bluesky-extension-tooltip';
  tooltip.textContent = message;
  tooltip.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0085ff;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(tooltip);
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('bluesky-extension-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

/**
 * Show error message
 */
function showError(message) {
  const error = document.createElement('div');
  error.textContent = '⚠️ ' + message;
  error.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  document.body.appendChild(error);

  setTimeout(() => {
    error.remove();
  }, 5000);
}

/**
 * Show success overlay
 */
function showSuccessOverlay() {
  const overlay = document.createElement('div');
  overlay.textContent = '✓ Posted to Bluesky!';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #00d26a;
    color: white;
    padding: 20px 40px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 18px;
    font-weight: 600;
    z-index: 1000001;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 2000);
}

console.log('Bluesky Screenshot Extension content script loaded');
