// ============================================================================
// ERROR HANDLING DESIGN FOR BLUESKY SCREENSHOT EXTENSION
// ============================================================================

// ----------------------------------------------------------------------------
// 1. ERROR TYPES & HIERARCHY
// ----------------------------------------------------------------------------

/**
 * Base error class for all extension errors
 */
export class ExtensionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string,
    public readonly recoverable: boolean = true,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      details: this.details,
    };
  }
}

/**
 * Screenshot-related errors
 */
export class ScreenshotError extends ExtensionError {
  constructor(message: string, userMessage: string, details?: Record<string, unknown>) {
    super(message, 'SCREENSHOT_ERROR', userMessage, true, details);
  }
}

/**
 * Bluesky API errors
 */
export class BlueskyAPIError extends ExtensionError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    userMessage?: string,
    recoverable: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'BLUESKY_API_ERROR',
      userMessage || 'Failed to post to Bluesky. Please try again.',
      recoverable,
      { ...details, statusCode }
    );
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends ExtensionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      message,
      'AUTH_ERROR',
      'Authentication failed. Please check your Bluesky credentials in settings.',
      true,
      details
    );
  }
}

/**
 * Network errors
 */
export class NetworkError extends ExtensionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      message,
      'NETWORK_ERROR',
      'Network connection failed. Please check your internet connection.',
      true,
      details
    );
  }
}

/**
 * Permission errors
 */
export class PermissionError extends ExtensionError {
  constructor(message: string, permission: string) {
    super(
      message,
      'PERMISSION_ERROR',
      `Permission required: ${permission}. Please grant access in extension settings.`,
      false,
      { permission }
    );
  }
}

/**
 * User input/selection errors
 */
export class SelectionError extends ExtensionError {
  constructor(message: string, userMessage: string) {
    super(message, 'SELECTION_ERROR', userMessage, true);
  }
}

// ----------------------------------------------------------------------------
// 2. ERROR HANDLER SERVICE
// ----------------------------------------------------------------------------

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableTelemetry: boolean;
  showNotifications: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: ExtensionError[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableTelemetry: false,
      showNotifications: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Main error handling method
   */
  async handle(error: Error | ExtensionError, context?: string): Promise<void> {
    const extensionError = this.normalizeError(error);

    // Log the error
    if (this.config.enableLogging) {
      this.logError(extensionError, context);
    }

    // Store in error log
    this.errorLog.push(extensionError);
    if (this.errorLog.length > 100) {
      this.errorLog.shift(); // Keep only last 100 errors
    }

    // Show notification to user
    if (this.config.showNotifications) {
      await this.showNotification(extensionError);
    }

    // Send telemetry (if enabled)
    if (this.config.enableTelemetry) {
      await this.sendTelemetry(extensionError, context);
    }
  }

  /**
   * Convert any error to ExtensionError
   */
  private normalizeError(error: Error | ExtensionError): ExtensionError {
    if (error instanceof ExtensionError) {
      return error;
    }

    // Handle specific error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(error.message, { originalError: error.message });
    }

    // Generic unknown error
    return new ExtensionError(
      error.message,
      'UNKNOWN_ERROR',
      'An unexpected error occurred. Please try again.',
      true,
      { originalError: error.message }
    );
  }

  /**
   * Log error to console
   */
  private logError(error: ExtensionError, context?: string): void {
    console.error(
      `[${error.name}] ${context ? `(${context})` : ''} ${error.message}`,
      error.toJSON()
    );
  }

  /**
   * Show browser notification
   */
  private async showNotification(error: ExtensionError): Promise<void> {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/error.png', // You'll need to add this
        title: 'Bluesky Screenshot Extension',
        message: error.userMessage,
        priority: error.recoverable ? 1 : 2,
      });
    } catch (notifError) {
      console.error('Failed to show notification:', notifError);
    }
  }

  /**
   * Send telemetry data (implement based on your analytics service)
   */
  private async sendTelemetry(error: ExtensionError, context?: string): Promise<void> {
    // Implement your telemetry logic here
    // Example: send to analytics service, error tracking service, etc.
    console.log('Telemetry:', { error: error.toJSON(), context });
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ExtensionError[] {
    return this.errorLog.slice(-limit);
  }
}

// ----------------------------------------------------------------------------
// 3. RETRY MECHANISM
// ----------------------------------------------------------------------------

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  exponentialBackoff: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config: RetryOptions = {
    maxRetries: 3,
    delay: 1000,
    exponentialBackoff: true,
    ...options,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-recoverable errors
      if (error instanceof ExtensionError && !error.recoverable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay
      const delay = config.exponentialBackoff
        ? config.delay * Math.pow(2, attempt)
        : config.delay;

      // Call retry callback
      if (config.onRetry) {
        config.onRetry(attempt + 1, error as Error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// ----------------------------------------------------------------------------
// 4. SPECIFIC ERROR SCENARIOS
// ----------------------------------------------------------------------------

/**
 * Handle screenshot capture errors
 */
export async function captureScreenshotSafely(
  region: { x: number; y: number; width: number; height: number }
): Promise<string> {
  try {
    // Validate region
    if (region.width <= 0 || region.height <= 0) {
      throw new ScreenshotError(
        'Invalid screenshot region dimensions',
        'Please select a valid text region to capture.'
      );
    }

    // Capture screenshot using Chrome API
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });

    // Crop to region (you'll need to implement the cropping logic)
    const croppedDataUrl = await cropImage(dataUrl, region);

    return croppedDataUrl;
  } catch (error) {
    if (error instanceof ScreenshotError) {
      throw error;
    }

    if (error instanceof Error && error.message.includes('permission')) {
      throw new PermissionError(
        'Screenshot permission denied',
        'activeTab or tabs permission'
      );
    }

    throw new ScreenshotError(
      `Screenshot capture failed: ${(error as Error).message}`,
      'Failed to capture screenshot. Please try again.',
      { error: (error as Error).message }
    );
  }
}

/**
 * Handle text selection errors
 */
export function getSelectedTextSafely(): string {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim().length === 0) {
    throw new SelectionError(
      'No text selected',
      'Please highlight some text before creating a post.'
    );
  }

  const text = selection.toString().trim();

  if (text.length > 1000) {
    throw new SelectionError(
      'Selected text too long',
      'Please select less than 1000 characters for alt text.'
    );
  }

  return text;
}

/**
 * Handle Bluesky API errors
 */
export async function postToBluesky(
  imageData: string,
  altText: string,
  credentials: { identifier: string; password: string }
): Promise<void> {
  try {
    // Authenticate
    const authResponse = await withRetry(
      () =>
        fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }),
      { maxRetries: 2 }
    );

    if (!authResponse.ok) {
      if (authResponse.status === 401) {
        throw new AuthenticationError('Invalid credentials');
      }
      throw new BlueskyAPIError(
        `Auth failed: ${authResponse.status}`,
        authResponse.status
      );
    }

    const { accessJwt } = await authResponse.json();

    // Upload image
    const imageBlob = await dataUrlToBlob(imageData);
    const uploadResponse = await withRetry(
      () =>
        fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
          method: 'POST',
          headers: {
            'Content-Type': imageBlob.type,
            Authorization: `Bearer ${accessJwt}`,
          },
          body: imageBlob,
        }),
      { maxRetries: 2 }
    );

    if (!uploadResponse.ok) {
      if (uploadResponse.status === 429) {
        throw new BlueskyAPIError(
          'Rate limit exceeded',
          429,
          'Too many posts. Please wait a moment before trying again.',
          true
        );
      }
      throw new BlueskyAPIError(`Upload failed: ${uploadResponse.status}`, uploadResponse.status);
    }

    const { blob } = await uploadResponse.json();

    // Create post
    const postResponse = await withRetry(
      () =>
        fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessJwt}`,
          },
          body: JSON.stringify({
            repo: credentials.identifier,
            collection: 'app.bsky.feed.post',
            record: {
              $type: 'app.bsky.feed.post',
              text: '', // Empty text, just image
              createdAt: new Date().toISOString(),
              embed: {
                $type: 'app.bsky.embed.images',
                images: [
                  {
                    alt: altText,
                    image: blob,
                  },
                ],
              },
            },
          }),
        }),
      { maxRetries: 2 }
    );

    if (!postResponse.ok) {
      throw new BlueskyAPIError(`Post failed: ${postResponse.status}`, postResponse.status);
    }
  } catch (error) {
    if (error instanceof ExtensionError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Failed to connect to Bluesky', { error: error.message });
    }

    throw new BlueskyAPIError(`Unexpected error: ${(error as Error).message}`);
  }
}

// ----------------------------------------------------------------------------
// 5. HELPER FUNCTIONS
// ----------------------------------------------------------------------------

async function cropImage(
  dataUrl: string,
  region: { x: number; y: number; width: number; height: number }
): Promise<string> {
  // Implement image cropping logic
  // You can use Canvas API for this
  return dataUrl; // Placeholder
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

// ----------------------------------------------------------------------------
// 6. USAGE EXAMPLE
// ----------------------------------------------------------------------------

// Initialize error handler
const errorHandler = new ErrorHandler({
  enableLogging: true,
  showNotifications: true,
  maxRetries: 3,
});

// Example: Main workflow with error handling
export async function handleScreenshotAndPost(): Promise<void> {
  try {
    // Get selected text
    const selectedText = getSelectedTextSafely();

    // Get selection region (you'll need to implement this)
    const region = await getSelectionRegion();

    // Capture screenshot
    const screenshot = await captureScreenshotSafely(region);

    // Get credentials from storage
    const credentials = await getCredentials();

    if (!credentials) {
      throw new AuthenticationError('No credentials found. Please configure Bluesky login.');
    }

    // Post to Bluesky
    await postToBluesky(screenshot, selectedText, credentials);

    // Show success notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/success.png',
      title: 'Success!',
      message: 'Posted to Bluesky successfully',
    });
  } catch (error) {
    await errorHandler.handle(error as Error, 'handleScreenshotAndPost');
  }
}

// Placeholder functions (implement these based on your needs)
async function getSelectionRegion() {
  return { x: 0, y: 0, width: 100, height: 100 };
}

async function getCredentials() {
  const result = await chrome.storage.sync.get(['blueskyIdentifier', 'blueskyPassword']);
  if (!result.blueskyIdentifier || !result.blueskyPassword) {
    return null;
  }
  return {
    identifier: result.blueskyIdentifier,
    password: result.blueskyPassword,
  };
}
