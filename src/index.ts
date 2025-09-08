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
  message?: string;
  buttonText?: string;
  showModal?: boolean;
  autoRedirect?: boolean;
  fallbackUrl?: string;
}

/**
 * Detects if the current browsing session is within an in-app browser
 */
export class InAppBrowserDetector {
  private static readonly IN_APP_PATTERNS = {
    instagram: /instagram/i,
    facebook: /FBAN|FBAV|FB_IAB/i,
    twitter: /TwitterAndroid|Twitter for iPhone/i,
    telegram: /TelegramBot/i,
    whatsapp: /WhatsApp/i,
    snapchat: /Snapchat/i,
    tiktok: /musical_ly|TikTok/i,
    linkedin: /LinkedInApp/i,
    wechat: /MicroMessenger/i,
    line: /Line/i,
    kakaotalk: /KAKAOTALK/i,
  };

  /**
   * Analyzes the current browser environment
   */
  static analyze(): BrowserInfo {
    const userAgent = navigator.userAgent;
    
    for (const [appName, pattern] of Object.entries(this.IN_APP_PATTERNS)) {
      if (pattern.test(userAgent)) {
        return {
          isInApp: true,
          platform: this.getPlatform(),
          userAgent,
          appName,
        };
      }
    }

    return {
      isInApp: false,
      platform: this.getPlatform(),
      userAgent,
    };
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
    showModal: true,
    autoRedirect: false,
  };

  /**
   * Attempts to escape from the in-app browser
   */
  static escape(options: EscapeOptions = {}): boolean {
    const browserInfo = InAppBrowserDetector.analyze();
    
    if (!browserInfo.isInApp) {
      return false; // Already in a regular browser
    }

    const config = { ...this.defaultOptions, ...options };
    const currentUrl = config.fallbackUrl || window.location.href;

    if (config.autoRedirect) {
      this.performRedirect(currentUrl, browserInfo);
      return true;
    }

    if (config.showModal) {
      this.showEscapeModal(currentUrl, config, browserInfo);
      return true;
    }

    return false;
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
    console.log('InAppBrowserEscaper: Starting enhanced redirect for:', url);
    console.log('Browser info:', browserInfo);
    
    // Enhanced redirect strategies with multiple fallbacks
    const strategies = this.getRedirectStrategies(url, browserInfo);
    console.log(`InAppBrowserEscaper: Found ${strategies.length} strategies to try`);
    
    this.executeStrategiesSequentially(strategies, url, 0);
  }

  /**
   * Executes strategies sequentially with small delays
   */
  private static executeStrategiesSequentially(strategies: Array<() => boolean>, url: string, index: number): void {
    if (index >= strategies.length) {
      console.warn('InAppBrowserEscaper: All strategies failed, using final fallback');
      window.location.href = url;
      return;
    }
    
    const strategy = strategies[index];
    console.log(`InAppBrowserEscaper: Trying strategy ${index + 1}/${strategies.length}: ${strategy.name}`);
    
    try {
      if (strategy()) {
        console.log('InAppBrowserEscaper: Redirect successful with strategy:', strategy.name);
        return;
      }
    } catch (error) {
      console.warn(`InAppBrowserEscaper: Strategy ${strategy.name} failed:`, error);
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

    // Platform-specific optimizations (FIRST PRIORITY)
    if (browserInfo.platform === 'ios') {
      // iOS-specific strategies - try Safari schemes FIRST
      strategies.push(
        Object.assign(() => {
          // x-safari-https scheme for iOS (most reliable)
          const safariUrl = url.replace(/^https?:\/\//, 'x-safari-https://');
          window.location.href = safariUrl;
          return true;
        }, { name: 'ios-safari-https-scheme' }),
        
        Object.assign(() => {
          // Alternative: x-safari-http scheme
          const safariUrl = url.replace(/^https?:\/\//, 'x-safari-http://');
          window.location.href = safariUrl;
          return true;
        }, { name: 'ios-safari-http-scheme' })
      );
    } else if (browserInfo.platform === 'android') {
      // Android-specific strategies - try Android intents FIRST
      strategies.push(
        Object.assign(() => {
          // Try Android intent
          const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
          window.location.href = intentUrl;
          return true;
        }, { name: 'android-intent' })
      );
    }

    // Universal strategies (fallback for all platforms)
    strategies.push(
      // Strategy 1: Window.open with different targets
      Object.assign(() => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow && !newWindow.closed) {
          newWindow.focus();
          return true;
        }
        return false;
      }, { name: 'window-open-blank' }),

      // Strategy 2: Window.open with _top target
      Object.assign(() => {
        const newWindow = window.open(url, '_top');
        return !!newWindow;
      }, { name: 'window-open-top' }),

      // Strategy 3: Create invisible anchor and click
      Object.assign(() => {
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
      }, { name: 'anchor-click' }),

      // Strategy 4: Form submission method
      Object.assign(() => {
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
      }, { name: 'form-submit' }),

      // Strategy 5: Location assignment with timeout
      Object.assign(() => {
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
      }, { name: 'location-assign-delayed' }),

      // Strategy 6: Direct location change
      Object.assign(() => {
        window.location.href = url;
        return true;
      }, { name: 'location-href' })
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
   * Enhanced escape method that tries multiple strategies
   */
  static forceEscape(url?: string): void {
    const targetUrl = url || window.location.href;
    const browserInfo = InAppBrowserDetector.analyze();
    
    // Try immediate redirect
    this.performRedirect(targetUrl, browserInfo);
    
    // Also copy URL to clipboard as backup
    this.copyUrlToClipboard(targetUrl);
    
    // Show instructions overlay
    this.showQuickInstructions(targetUrl, browserInfo);
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
