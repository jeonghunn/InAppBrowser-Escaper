/**
 * InAppBrowserEscaper - A TypeScript library to help users escape from in-app browsers
 * 
 * This library detects when users are browsing within in-app browsers (like Instagram, 
 * Facebook, Telegram, etc.) and provides utilities to help them open the content in 
 * their default browser for a better experience.
 */

export interface BrowserInfo {
  isInApp: boolean;
  platform: string;
  userAgent: string;
  appName?: string;
}

export interface EscapeOptions {
  /** Custom message to display in the modal */
  message?: string;
  /** Text for the action button */
  buttonText?: string;
  /** 
   * Show a modal for user interaction (default: false)
   * - When true: Shows modal with instructions and action button
   * - When false: Automatically attempts to redirect to external browser
   */
  showModal?: boolean;
  /** URL to redirect to (defaults to current URL) */
  fallbackUrl?: string;
  /** Force escape attempt even if not in an in-app browser */
  force?: boolean;
  /** Show quick visual instructions overlay */
  showQuickInstructions?: boolean;
  /** Enable debug logging to console (default: false) */
  debug?: boolean;
}

/**
 * Detects if the current browsing session is within an in-app browser
 */
export class InAppBrowserDetector {
  private static readonly IN_APP_PATTERNS = {
    instagram: /instagram/i,
    facebook: /FBAN|FBAV|FB_IAB/i,
    twitter: /TwitterAndroid|Twitter for iPhone/i,
    whatsapp: /WhatsApp/i,
    snapchat: /Snapchat/i,
    tiktok: /musical_ly|TikTok/i,
    linkedin: /LinkedInApp/i,
    wechat: /MicroMessenger/i,
    line: /Line/i,
    kakaotalk: /KAKAOTALK/i,
    chrome_custom_tabs: /; wv\)|CCT|CustomTabsIntent/i,
    android_webview: /Android.*Chrome\/.*Mobile.*Safari\/537\.36$/i,
  };

  /**
   * Analyzes the current browser environment
   */
  static analyze(): BrowserInfo {
    const userAgent: string = navigator.userAgent;
    
    // Check for specific app patterns 
    for (const [appName, pattern] of Object.entries(this.IN_APP_PATTERNS)) {
      if (appName === 'android_webview') continue;
      
      if (pattern.test(userAgent)) {
        return {
          isInApp: true,
          platform: this.getPlatform(),
          userAgent,
          appName,
        };
      }
    }
    
    // Check for iOS Safari in-app browser (SFSafariViewController)
    if (this.isIOSSafariInApp(userAgent)) {
      return {
        isInApp: true,
        platform: this.getPlatform(),
        userAgent,
        appName: 'ios_safari_in_app',
      };
    }
    
    // Check for Android WebView as fallback (catches generic in-app browsers)
    if (this.isAndroidWebView(userAgent)) {
      return {
        isInApp: true,
        platform: this.getPlatform(),
        userAgent,
        appName: 'android_webview',
      };
    }

    return {
      isInApp: false,
      platform: this.getPlatform(),
      userAgent,
    };
  }

  /**
   * Detects iOS Safari in-app browser (SFSafariViewController)
   */
  private static isIOSSafariInApp(userAgent: string): boolean {
    // Must be iOS
    if (!/iPhone|iPad|iPod/.test(userAgent)) return false;
    
    // Must be Safari (not other browsers like Chrome, Firefox, etc.)
    if (!(/Safari/.test(userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(userAgent))) {
      return false;
    }
    
    // Exclude if it's clearly identified as another browser
    if (/Chrome|Firefox|Opera|Edge/.test(userAgent)) {
      return false;
    }
    
    // Additional check: SFSafariViewController doesn't support some APIs
    // Check if we're in a restricted context
    if (typeof (window as any).safari === 'undefined' && 
        typeof (window as any).webkit !== 'undefined') {
      return true;
    }
    
    return false;
  }

  /**
   * Detects Android WebView browsers (generic in-app browsers)
   */
  private static isAndroidWebView(userAgent: string): boolean {
    // Must be Android
    if (!/Android/.test(userAgent)) return false;
    
    // Must have Chrome
    if (!/Chrome\//.test(userAgent)) return false;
    
    // Must be mobile
    if (!/Mobile/.test(userAgent)) return false;
    
    // Must end with the standard WebKit suffix
    if (!/Safari\/537\.36$/.test(userAgent)) return false;
    
    // Exclude known real browsers
    if (/Edge|EdgA|CriOS|FxiOS|OPiOS|SamsungBrowser|MiuiBrowser|Huawei|Mi Browser|Opera|OPR/i.test(userAgent)) {
      return false;
    }
    
    // Exclude if it has Version/ indicator (real browsers usually have this)
    if (/Version\/[\d.]+/.test(userAgent)) {
      return false;
    }
    
    // Look for indicators that suggest this is a WebView rather than a full browser
    const webViewIndicators = [
      // Single letter device models (common in WebViews)
      /Android [^;]+; [A-Z]\)/,
      // Very generic device models with few characters
      /Android [^;]+; [A-Z]{1,3}\d*\)/,
      // Very recent Chrome versions (WebViews often use latest)
      /Chrome\/1[2-9]\d\./
    ];
    
    // Check if any WebView indicators are present
    return webViewIndicators.some(indicator => indicator.test(userAgent));
  }

  /**
   * Checks if currently in an in-app browser
   */
  static isInAppBrowser(): boolean {
    return this.analyze().isInApp;
  }

  /**
   * Gets the detected app name if in an in-app browser
   */
  static getAppName(): string | undefined {
    return this.analyze().appName;
  }

  private static getPlatform(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Windows/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'mac';
    if (/Linux/.test(ua)) return 'linux';
    return 'unknown';
  }
}

/**
 * Provides escape utilities for in-app browsers
 */
export class InAppBrowserEscaper {
  private static defaultOptions: EscapeOptions = {
    message: 'For the best experience, please open this in your browser',
    buttonText: '🚀 Open in Browser',
    showModal: false, // Default: auto-redirect when escape() is called
    debug: false, // Default: no console logs in production
  };

  /**
   * Internal debug logger - only logs when debug mode is enabled
   */
  private static debugLog(message: string, ...args: any[]): void {
    // Only log if debug mode is explicitly enabled via the last escape() call
    if (this.defaultOptions.debug) {
      console.log(`[InAppBrowserEscaper] ${message}`, ...args);
    }
  }

  /**
   * Internal debug warning - only logs when debug mode is enabled
   */
  private static debugWarn(message: string, ...args: any[]): void {
    // Only log if debug mode is explicitly enabled via the last escape() call
    if (this.defaultOptions.debug) {
      console.warn(`[InAppBrowserEscaper] ${message}`, ...args);
    }
  }

  /**
   * Attempts to escape from the in-app browser
   * 
   * Behavior:
   * - showModal: false (default) → Auto-redirects to external browser
   * - showModal: true → Shows modal with instructions and action button
   * - force: true → Always auto-redirects, even if showModal is true
   * - debug: true → Enables console logging for debugging
   */
  static escape(options: EscapeOptions = {}): boolean {
    const browserInfo = InAppBrowserDetector.analyze();
    
    // Update debug mode setting
    const config = { ...this.defaultOptions, ...options };
    this.defaultOptions.debug = config.debug || false;
    
    if (!browserInfo.isInApp && !options.force) {
      return false; // Already in a regular browser
    }

    const currentUrl = config.fallbackUrl || window.location.href;

    // Force mode takes priority - always auto-redirect
    if (config.force) {
      this.performRedirect(currentUrl, browserInfo);
      this.copyUrlToClipboard(currentUrl);
      
      if (config.showQuickInstructions) {
        this.showQuickInstructions(currentUrl, browserInfo);
      }
      
      return true;
    }

    // Show modal if explicitly requested
    if (config.showModal) {
      this.showEscapeModal(currentUrl, config, browserInfo);
      return true;
    }

    // Otherwise, auto-redirect (default behavior)
    this.performRedirect(currentUrl, browserInfo);
    
    // Show quick instructions if explicitly requested
    if (config.showQuickInstructions) {
      this.showQuickInstructions(currentUrl, browserInfo);
    }
    
    return true;
  }

  /**
   * Shows a modal with escape instructions
   */
  private static showEscapeModal(url: string, options: EscapeOptions, browserInfo: BrowserInfo): void {
    const modal = this.createModal(url, options, browserInfo);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
  }

  /**
   * Creates the escape modal element
   */
  private static createModal(url: string, options: EscapeOptions, browserInfo: BrowserInfo): HTMLElement {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      margin: 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    const instructions = this.getEscapeInstructions(browserInfo);
    
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">🚀 Better Experience Available</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">${options.message}</p>
      <div style="margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; font-size: 14px; color: #555;">
        ${instructions}
      </div>
      <div style="margin-top: 20px;">
        <button id="escaper-open-btn" style="
          background: #007AFF;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        ">${options.buttonText}</button>
        <button id="escaper-close-btn" style="
          background: #666;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    modal.appendChild(content);

    // Add event listeners
    const openBtn = content.querySelector('#escaper-open-btn');
    const closeBtn = content.querySelector('#escaper-close-btn');

    openBtn?.addEventListener('click', () => {
      // Use the same enhanced redirect strategies for all platforms
      this.performRedirect(url, browserInfo);
      this.copyUrlToClipboard(url);
      this.closeModal(modal);
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal(modal);
    });

    return modal;
  }

  /**
   * Gets platform-specific escape instructions
   */
  private static getEscapeInstructions(browserInfo: BrowserInfo): string {
    if (browserInfo.platform === 'ios') {
      return `
        <strong>On iOS:</strong><br>
        1. Tap "Open in Browser" below (tries multiple Safari schemes)<br>
        2. Or tap the share button (↗) → "Open in Safari"<br>
        3. URL is copied to clipboard as backup
      `;
    } else if (browserInfo.platform === 'android') {
      return `
        <strong>On Android:</strong><br>
        1. Tap "Open in Browser" below (uses Android intents)<br>
        2. Or tap the menu (⋮) → "Open in browser"<br>
        3. URL is copied to clipboard as backup
      `;
    } else {
      return `
        <strong>To open in your browser:</strong><br>
        1. Tap "Open in Browser" below (tries multiple methods)<br>
        2. Or look for the "Open in browser" option<br>
        3. URL is copied to clipboard as backup
      `;
    }
  }

  /**
   * Performs the redirect to open in external browser
   */
  private static performRedirect(url: string, browserInfo: BrowserInfo): void {
    this.debugLog('Starting enhanced redirect for:', url);
    this.debugLog('Browser info:', browserInfo);
    
    // Enhanced redirect strategies with multiple fallbacks
    const strategies = this.getRedirectStrategies(url, browserInfo);
    this.debugLog(`Found ${strategies.length} strategies to try`);
    
    this.executeStrategiesSequentially(strategies, url, 0);
  }

  /**
   * Executes strategies sequentially with small delays
   */
  private static executeStrategiesSequentially(strategies: Array<() => boolean>, url: string, index: number): void {
    if (index >= strategies.length) {
      this.debugWarn('All strategies failed, using final fallback');
      window.location.href = url;
      return;
    }
    
    const strategy = strategies[index];
    this.debugLog(`Trying strategy ${index + 1}/${strategies.length}: ${strategy.name}`);
    
    try {
      if (strategy()) {
        this.debugLog('Redirect successful with strategy:', strategy.name);
        return;
      }
    } catch (error) {
      this.debugWarn(`Strategy ${strategy.name} failed:`, error);
    }
    
    // Try next strategy after a small delay
    setTimeout(() => {
      this.executeStrategiesSequentially(strategies, url, index + 1);
    }, 100);
  }

  /**
   * Gets redirect strategies based on platform and app
   */
  private static getRedirectStrategies(url: string, browserInfo: BrowserInfo): Array<() => boolean> {
    const strategies: Array<() => boolean> = [];

    // Platform-specific optimizations
    if (browserInfo.platform === 'ios') {
      // iOS-specific strategies - try Safari schemes FIRST
      const iosSafariHttps = function iosSafariHttps() {
        // x-safari-https scheme for iOS (most reliable)
        const safariUrl = url.replace(/^https?:\/\//, 'x-safari-https://');
        window.location.href = safariUrl;
        return true;
      };
      
      strategies.push(iosSafariHttps);
    } else if (browserInfo.platform === 'android') {
      // Android-specific strategies - try Android intents FIRST
      const androidIntent = function androidIntent() {
        // Try Android intent
        const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
        window.location.href = intentUrl;
        return true;
      };
      
      strategies.push(androidIntent);
    }

    // Universal strategies (fallback for all platforms)
    const windowOpenBlank = function windowOpenBlank() {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) {
        newWindow.focus();
        return true;
      }
      return false;
    };

    const windowOpenTop = function windowOpenTop() {
      const newWindow = window.open(url, '_top');
      return !!newWindow;
    };

    const anchorClick = function anchorClick() {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      
      // Simulate user click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      anchor.dispatchEvent(clickEvent);
      
      // Clean up
      setTimeout(() => document.body.removeChild(anchor), 100);
      return true;
    };

    const formSubmit = function formSubmit() {
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = url;
      form.target = '_blank';
      form.style.display = 'none';
      document.body.appendChild(form);
      form.submit();
      
      // Clean up
      setTimeout(() => document.body.removeChild(form), 100);
      return true;
    };

    const locationAssignDelayed = function locationAssignDelayed() {
      const timeout = setTimeout(() => {
        window.location.assign(url);
      }, 100);
      
      // Try to open in new window first
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        clearTimeout(timeout);
        newWindow.location.href = url;
        newWindow.focus();
        return true;
      }
      return false;
    };

    const locationHref = function locationHref() {
      window.location.href = url;
      return true;
    };

    strategies.push(
      windowOpenBlank,
      windowOpenTop,
      anchorClick,
      formSubmit,
      locationAssignDelayed,
      locationHref
    );

    return strategies;
  }

  /**
   * Closes the escape modal
   */
  private static closeModal(modal: HTMLElement): void {
    modal.remove();
  }

  /**
   * Utility method to copy URL to clipboard
   */
  static async copyUrlToClipboard(url?: string): Promise<boolean> {
    const urlToCopy = url || window.location.href;
    
    try {
      await navigator.clipboard.writeText(urlToCopy);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = urlToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (fallbackError) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }



  /**
   * Shows quick instructions overlay
   */
  private static showQuickInstructions(_url: string, browserInfo: BrowserInfo): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    const instructions = browserInfo.platform === 'ios' 
      ? 'Tap the Share button (↗) at the bottom, then select "Open in Safari"'
      : 'Tap the menu (⋮) and select "Open in browser"';

    overlay.innerHTML = `
      <div style="max-width: 350px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px;">Open in Browser</h2>
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
          ${instructions}
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">URL copied to clipboard!</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #007AFF;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        ">Got it</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
      }
    }, 10000);
  }
}

// Default export for convenience
export default InAppBrowserEscaper;
