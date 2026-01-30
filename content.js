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
    // Use viewport coordinates since captureVisibleTab only captures the visible area
    const region = {
      x: Math.max(0, rect.left - padding),
      y: Math.max(0, rect.top - padding),
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
    console.log('📐 Starting crop and post process...');
    console.log('Region:', region);
    console.log('Selected text:', selectedText);
    
    // Create a canvas to crop the image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    console.log('Image loaded:', img.width, 'x', img.height);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to process screenshot. Please try again.');
    }

    // Set canvas size to cropped region
    canvas.width = region.width * window.devicePixelRatio;
    canvas.height = region.height * window.devicePixelRatio;

    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    console.log('Device pixel ratio:', window.devicePixelRatio);

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
    console.log('Cropped image size:', croppedDataUrl.length, 'characters');

    // Get credentials
    const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
      'blueskyIdentifier',
      'blueskyPassword',
    ]);

    console.log('Retrieved credentials from storage');

    // Post to Bluesky
    await postToBluesky(croppedDataUrl, selectedText, blueskyIdentifier, blueskyPassword);

    // Show success notification
    showSuccessOverlay();
  } catch (error) {
    console.error('❌ Error in cropAndPost:', error);
    showError(error.message || 'Failed to post to Bluesky. Please try again.');
    throw error;
  }
}

/**
 * Post to Bluesky API
 */
async function postToBluesky(imageData, altText, identifier, password) {
  console.log('🔵 Starting Bluesky post process...');
  console.log('Alt text length:', altText.length);
  console.log('Identifier:', identifier);
  
  // Authenticate
  console.log('🔐 Authenticating with Bluesky...');
  const authResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  console.log('Auth response status:', authResponse.status);

  if (!authResponse.ok) {
    const errorData = await authResponse.json().catch(() => ({}));
    console.error('❌ Authentication failed:', errorData);
    if (authResponse.status === 401) {
      throw new Error('Invalid credentials. Please check your Bluesky login in settings.');
    }
    throw new Error('Authentication failed. Please try again.');
  }

  const authData = await authResponse.json();
  const { accessJwt, did } = authData;
  console.log('✅ Authentication successful!');
  console.log('DID:', did);

  // Convert data URL to blob
  console.log('📸 Converting screenshot to blob...');
  const response = await fetch(imageData);
  const imageBlob = await response.blob();
  console.log('Image size:', imageBlob.size, 'bytes');
  console.log('Image type:', imageBlob.type);

  // Upload image
  console.log('⬆️ Uploading image to Bluesky...');
  const uploadResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
    method: 'POST',
    headers: {
      'Content-Type': imageBlob.type,
      Authorization: `Bearer ${accessJwt}`,
    },
    body: imageBlob,
  });

  console.log('Upload response status:', uploadResponse.status);

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    console.error('❌ Image upload failed:', errorData);
    if (uploadResponse.status === 429) {
      throw new Error('Too many posts. Please wait a moment before trying again.');
    }
    throw new Error('Failed to upload image. Please try again.');
  }

  const uploadData = await uploadResponse.json();
  const { blob } = uploadData;
  console.log('✅ Image uploaded successfully!');
  console.log('Blob ref:', blob.ref);

  // Create post
  console.log('📝 Creating post...');
  const postData = {
    repo: did,  // Use DID, not identifier (email/handle)
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
  };
  
  console.log('Post payload:', JSON.stringify(postData, null, 2));
  
  const postResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessJwt}`,
    },
    body: JSON.stringify(postData),
  });

  console.log('Post response status:', postResponse.status);

  if (!postResponse.ok) {
    const errorData = await postResponse.json().catch(() => ({}));
    console.error('❌ Post creation failed:', errorData);
    throw new Error('Failed to create post. Please try again.');
  }

  const postResult = await postResponse.json();
  console.log('✅ Post created successfully!');
  console.log('Post URI:', postResult.uri);
  console.log('Post CID:', postResult.cid);
  
  // DEBUG MODE: Auto-delete the post after creation
  console.log('🗑️ DEBUG MODE: Deleting test post...');
  try {
    const deleteResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.deleteRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessJwt}`,
      },
      body: JSON.stringify({
        repo: did,
        collection: 'app.bsky.feed.post',
        rkey: postResult.uri.split('/').pop(), // Extract record key from URI
      }),
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Test post deleted successfully!');
      console.log('🎉 Done! Post was created and deleted (debug mode).');
    } else {
      console.log('⚠️ Failed to delete post, but it was created successfully');
    }
  } catch (deleteError) {
    console.error('❌ Error deleting post:', deleteError);
    console.log('⚠️ Post was created but could not be deleted');
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
