// background.js - Service Worker for Chromium Extension
import { 
  ErrorHandler, 
  handleScreenshotAndPost,
  PermissionError 
} from './error-handling-design.js';

const errorHandler = new ErrorHandler({
  enableLogging: true,
  showNotifications: true,
  maxRetries: 3,
});

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'post-to-bluesky',
    title: 'Post to Bluesky',
    contexts: ['selection'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'post-to-bluesky' && tab?.id) {
    try {
      // Check if we have credentials
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      if (!blueskyIdentifier || !blueskyPassword) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Setup Required',
          message: 'Please configure your Bluesky credentials in the extension settings.',
        });
        chrome.runtime.openOptionsPage();
        return;
      }

      // Send message to content script to start the process
      chrome.tabs.sendMessage(tab.id, {
        action: 'captureSelection',
        selectedText: info.selectionText,
      });
    } catch (error) {
      await errorHandler.handle(error as Error, 'contextMenu');
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.action === 'captureScreenshot') {
        const { region, selectedText } = message;

        // Capture the visible tab
        const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab!.windowId, {
          format: 'png',
        });

        // Send back to content script for cropping
        chrome.tabs.sendMessage(sender.tab!.id!, {
          action: 'cropAndPost',
          dataUrl,
          region,
          selectedText,
        });

        sendResponse({ success: true });
      } else if (message.action === 'postToBluesky') {
        // This will be handled by importing the postToBluesky function
        sendResponse({ success: true });
      }
    } catch (error) {
      await errorHandler.handle(error as Error, 'messageHandler');
      sendResponse({ success: false, error: (error as Error).message });
    }
  })();

  return true; // Keep message channel open for async response
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      // Check credentials first
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      if (!blueskyIdentifier || !blueskyPassword) {
        chrome.runtime.openOptionsPage();
        return;
      }

      // Inject content script if needed and trigger selection mode
      await chrome.tabs.sendMessage(tab.id, { action: 'startSelectionMode' });
    } catch (error) {
      // Content script might not be injected yet
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });

      // Try again after a brief delay
      setTimeout(async () => {
        await chrome.tabs.sendMessage(tab.id!, { action: 'startSelectionMode' });
      }, 100);
    }
  }
});

console.log('Bluesky Screenshot Extension background script loaded');
