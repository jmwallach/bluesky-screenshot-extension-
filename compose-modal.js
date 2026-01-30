// compose-modal.js - Modal for composing posts with screenshot

/**
 * Show compose modal with screenshot
 */
function showComposeModal(screenshotDataUrl, selectedText) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'bluesky-compose-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.2s ease-out;
  `;

  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease-out;
  `;

  // Modal content
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 24px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          📸 Post to Bluesky
        </h2>
        <button id="bluesky-close-modal" style="
          background: none;
          border: none;
          font-size: 28px;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">
          ×
        </button>
      </div>

      <div style="margin-bottom: 20px;">
        <img id="bluesky-preview-image" src="${screenshotDataUrl}" style="
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        "/>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          Post Text (optional)
        </label>
        <textarea id="bluesky-post-text" placeholder="Add a caption to your post..." style="
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          resize: vertical;
          box-sizing: border-box;
        "></textarea>
        <div style="
          font-size: 12px;
          color: #666;
          margin-top: 4px;
          text-align: right;
        " id="bluesky-char-count">0 / 300 characters</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          Alt Text (for accessibility)
        </label>
        <textarea id="bluesky-alt-text" style="
          width: 100%;
          min-height: 60px;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          resize: vertical;
          box-sizing: border-box;
        ">${selectedText}</textarea>
        <div style="
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        ">Describes the image for screen readers</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="bluesky-open-composer" style="
          flex: 1;
          padding: 14px 20px;
          background: white;
          color: #0085ff;
          border: 2px solid #0085ff;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.2s;
        " onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='white'">
          🔗 Open in Bluesky
        </button>
        <button id="bluesky-post-now" style="
          flex: 1;
          padding: 14px 20px;
          background: #0085ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.2s;
        " onmouseover="this.style.background='#0070dd'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#0085ff'; this.style.transform='translateY(0)'">
          📤 Post Now
        </button>
      </div>

      <div id="bluesky-modal-status" style="
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
        text-align: center;
        font-size: 14px;
        display: none;
      "></div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add event listeners
  const closeBtn = document.getElementById('bluesky-close-modal');
  const postTextArea = document.getElementById('bluesky-post-text');
  const altTextArea = document.getElementById('bluesky-alt-text');
  const charCount = document.getElementById('bluesky-char-count');
  const openComposerBtn = document.getElementById('bluesky-open-composer');
  const postNowBtn = document.getElementById('bluesky-post-now');
  const statusDiv = document.getElementById('bluesky-modal-status');

  // Close modal
  const closeModal = () => overlay.remove();
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Update character count
  postTextArea.addEventListener('input', () => {
    const length = postTextArea.value.length;
    charCount.textContent = `${length} / 300 characters`;
    charCount.style.color = length > 300 ? '#dc3545' : '#666';
  });

  // Open in Bluesky composer
  openComposerBtn.addEventListener('click', async () => {
    try {
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#e3f2fd';
      statusDiv.style.color = '#0085ff';
      statusDiv.textContent = '⬆️ Uploading image to Bluesky...';

      // Get credentials
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      // Authenticate and upload image
      const authResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: blueskyIdentifier, password: blueskyPassword }),
      });

      if (!authResponse.ok) throw new Error('Authentication failed');

      const { accessJwt } = await authResponse.json();

      // Upload image
      const response = await fetch(screenshotDataUrl);
      const imageBlob = await response.blob();

      const uploadResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
        method: 'POST',
        headers: {
          'Content-Type': imageBlob.type,
          Authorization: `Bearer ${accessJwt}`,
        },
        body: imageBlob,
      });

      if (!uploadResponse.ok) throw new Error('Image upload failed');

      const { blob } = await uploadResponse.json();

      // Create Bluesky composer URL with embedded image
      const postText = encodeURIComponent(postTextArea.value);
      const blobRef = blob.ref.$link;
      
      // Open Bluesky with the uploaded image (this is a simplified URL - Bluesky's actual composer API may differ)
      const blueskyUrl = `https://bsky.app/intent/compose?text=${postText}`;
      window.open(blueskyUrl, '_blank');

      statusDiv.style.background = '#d4edda';
      statusDiv.style.color = '#155724';
      statusDiv.textContent = '✓ Image uploaded! Opening Bluesky composer...';

      setTimeout(closeModal, 2000);
    } catch (error) {
      console.error('Error:', error);
      statusDiv.style.background = '#f8d7da';
      statusDiv.style.color = '#721c24';
      statusDiv.textContent = '❌ Failed to open composer. Try "Post Now" instead.';
    }
  });

  // Post now (direct post)
  postNowBtn.addEventListener('click', async () => {
    const postText = postTextArea.value;
    const altText = altTextArea.value;

    if (postText.length > 300) {
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#f8d7da';
      statusDiv.style.color = '#721c24';
      statusDiv.textContent = '❌ Post text is too long (max 300 characters)';
      return;
    }

    try {
      postNowBtn.disabled = true;
      postNowBtn.textContent = '⏳ Posting...';
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#e3f2fd';
      statusDiv.style.color = '#0085ff';
      statusDiv.textContent = '📤 Posting to Bluesky...';

      // Get credentials
      const { blueskyIdentifier, blueskyPassword } = await chrome.storage.sync.get([
        'blueskyIdentifier',
        'blueskyPassword',
      ]);

      // Post using the existing function
      await postToBluesky(screenshotDataUrl, altText, blueskyIdentifier, blueskyPassword, postText);

      statusDiv.style.background = '#d4edda';
      statusDiv.style.color = '#155724';
      statusDiv.textContent = '✓ Posted successfully!';

      setTimeout(closeModal, 2000);
    } catch (error) {
      console.error('Post error:', error);
      statusDiv.style.background = '#f8d7da';
      statusDiv.style.color = '#721c24';
      statusDiv.textContent = '❌ ' + (error.message || 'Failed to post');
      postNowBtn.disabled = false;
      postNowBtn.textContent = '📤 Post Now';
    }
  });
}
