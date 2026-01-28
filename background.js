// background.js - Service Worker for Chromium Extension

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
      // Check if tab URL is accessible
      const url = tab.url || '';
      const restrictedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'file:'];
      const isRestricted = restrictedProtocols.some(protocol => url.startsWith(protocol));
      
      if (isRestricted) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Cannot Use Here',
          message: 'This extension cannot access browser pages or local files. Try a regular website.',
        });
        return;
      }

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

      // Try to send message to content script
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'captureSelection',
          selectedText: info.selectionText,
        });
      } catch (error) {
        // Content script not injected yet, inject it now
        console.log('Content script not found, injecting...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });
          
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css'],
          });

          // Wait for script to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Try again
          await chrome.tabs.sendMessage(tab.id, {
            action: 'captureSelection',
            selectedText: info.selectionText,
          });
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError);
          await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Cannot Access Page',
            message: 'Unable to capture screenshots on this page. Try a different website or reload the page.',
          });
        }
      }
    } catch (error) {
      console.error('Context menu error:', error);
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Error',
        message: 'An error occurred. Please try again or reload the page.',
      });
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
        const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
          format: 'png',
        });

        // Send back to content script for cropping
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'cropAndPost',
          dataUrl,
          region,
          selectedText,
        });

        sendResponse({ success: true });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
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
        await chrome.tabs.sendMessage(tab.id, { action: 'startSelectionMode' });
      }, 100);
    }
  }
});

console.log('Bluesky Screenshot Extension background script loaded');
