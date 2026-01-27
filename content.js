// content.js - Content Script
import {
  SelectionError,
  ScreenshotError,
  ErrorHandler,
  postToBluesky,
} from './error-handling-design.js';

const errorHandler = new ErrorHandler({
  enableLogging: true,
  showNotifications: true,
});

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
      await errorHandler.handle(error as Error, 'contentScript');
      sendResponse({ success: false, error: (error as Error).message });
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
      throw new SelectionError('No text selected', 'Please highlight some text first.');
    }

    if (selectedText.length > 1000) {
      throw new SelectionError(
        'Text too long',
        'Please select less than 1000 characters for alt text.'
      );
    }

    // Get the bounding rectangle of the selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      throw new SelectionError('Selection lost', 'Please try selecting the text again.');
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      throw new ScreenshotError(
        'Invalid selection region',
        'Cannot capture an empty region. Please select visible text.'
      );
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
    await errorHandler.handle(error as Error, 'handleCaptureSelection');
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
      throw new ScreenshotError(
        'Canvas context failed',
        'Failed to process screenshot. Please try again.'
      );
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
    await postToBluesky(croppedDataUrl, selectedText, {
      identifier: blueskyIdentifier,
      password: blueskyPassword,
    });

    // Show success notification
    showSuccessOverlay();
  } catch (error) {
    await errorHandler.handle(error as Error, 'cropAndPost');
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

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    style.remove();
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

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(tooltip);
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('bluesky-extension-tooltip');
  if (tooltip) {
    tooltip.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => tooltip.remove(), 300);
  }
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
    animation: successPop 0.5s ease-out;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes successPop {
      0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 300);
  }, 2000);
}

console.log('Bluesky Screenshot Extension content script loaded');
