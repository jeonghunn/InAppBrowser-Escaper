import { InAppBrowserDetector, InAppBrowserEscaper } from '../index';

describe('InAppBrowserDetector', () => {
  beforeEach(() => {
    // Reset navigator.userAgent for each test
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
    });
  });

  describe('analyze', () => {
    it('should detect regular browser', () => {
      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false);
      expect(result.platform).toBe('windows');
      expect(result.appName).toBeUndefined();
    });

    it('should detect Instagram in-app browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 154.0.0.37.120',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('ios');
      expect(result.appName).toBe('instagram');
    });

    it('should detect Facebook in-app browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone12,1;FBMD/iPhone;FBSN/iOS;FBSV/14.0;FBSS/2;FBID/phone;FBLC/en_US;FBOP/5]',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('ios');
      expect(result.appName).toBe('facebook');
    });

    it('should detect Android platform', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.platform).toBe('android');
    });

    it('should detect Android WebView (TelegramBot pattern)', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Mobile Safari/537.36 TelegramBot (like TwitterBot)',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false); // TelegramBot is not a webview, it's a bot crawler
      expect(result.platform).toBe('android');
      expect(result.appName).toBeUndefined();
    });

    it('should detect Android WebView with Telegram keyword in user agent', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.58 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('android');
      expect(result.appName).toBe('android_webview');
    });

    it('should detect Chrome Custom Tabs', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.164 Mobile Safari/537.36; wv)',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('android');
      expect(result.appName).toBe('chrome_custom_tabs');
    });

    it('should NOT detect bot crawlers as in-app browsers', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'TelegramBot (like TwitterBot)',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false);
      expect(result.appName).toBeUndefined();
    });

    it('should detect Android WebView with real-world generic user agent', () => {
      // This is the actual user agent from user's Telegram in-app browser
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 15; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.207 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.appName).toBe('android_webview');
    });

    it('should detect Android WebView with generic user agent when visiting any domain', () => {
      // Generic Chrome user agent with suspicious single-letter device model
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.58 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.appName).toBe('android_webview');
    });

    it('should detect Android WebView with real user agent from Telegram', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 15; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.207 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('android');
      expect(result.appName).toBe('android_webview');
    });

    it('should detect Android WebView with single letter device model', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13; A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.appName).toBe('android_webview');
    });

    it('should NOT detect regular Chrome on real device as WebView', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false);
      expect(result.appName).toBeUndefined();
    });

    it('should NOT detect Samsung Browser as WebView', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.0 Chrome/87.0.4280.141 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false);
      expect(result.appName).toBeUndefined();
    });

    it('should detect iOS Safari in-app browser (SFSafariViewController)', () => {
      // Mock iOS Safari user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        writable: true,
      });

      // Mock window.safari and window.webkit to simulate SFSafariViewController
      // SFSafariViewController has webkit but not safari object
      const windowAny = window as any;
      delete windowAny.safari; // Remove safari object (not present in SFSafariViewController)
      windowAny.webkit = {}; // Add webkit object (present in SFSafariViewController)

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(true);
      expect(result.platform).toBe('ios');
      expect(result.appName).toBe('ios_safari_in_app');

      // Clean up
      delete windowAny.webkit;
    });

    it('should NOT detect regular Safari as in-app browser', () => {
      // Mock iOS Safari user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        writable: true,
      });

      // Mock window.safari and window.webkit to simulate regular Safari
      // Regular Safari has both safari and webkit objects
      const windowAny = window as any;
      windowAny.safari = {}; // Safari object is present in regular Safari
      windowAny.webkit = {}; // webkit is also present

      const result = InAppBrowserDetector.analyze();
      expect(result.isInApp).toBe(false);
      expect(result.appName).toBeUndefined();

      // Clean up
      delete windowAny.safari;
      delete windowAny.webkit;
    });
  });

  describe('isInAppBrowser', () => {
    it('should return false for regular browser', () => {
      expect(InAppBrowserDetector.isInAppBrowser()).toBe(false);
    });

    it('should return true for in-app browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      expect(InAppBrowserDetector.isInAppBrowser()).toBe(true);
    });
  });

  describe('getAppName', () => {
    it('should return undefined for regular browser', () => {
      expect(InAppBrowserDetector.getAppName()).toBeUndefined();
    });

    it('should return app name for in-app browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      expect(InAppBrowserDetector.getAppName()).toBe('instagram');
    });
  });
});

describe('InAppBrowserEscaper', () => {
  beforeEach(() => {
    // Clean up any existing modals
    document.querySelectorAll('[style*="z-index: 999999"]').forEach(el => el.remove());
    
    // Reset navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
    });

    Object.defineProperty(window.navigator, 'userActivation', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  describe('escape', () => {
    it('should return false when not in in-app browser', () => {
      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(false);
    });

    it('should not emit debug events when debug is disabled', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });

      const events: string[] = [];
      const onDebug = (e: Event) => events.push((e as CustomEvent).detail.type);
      window.addEventListener('inAppBrowserEscaper:debug', onDebug);

      try {
        // debug:false is explicit because defaultOptions.debug is sticky static
        // state; relying on the default would make this order-dependent.
        InAppBrowserEscaper.escape({ fallbackUrl: 'https://example.com', debug: false });
        const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
        button?.click();
        expect(events).toEqual([]);
      } finally {
        window.removeEventListener('inAppBrowserEscaper:debug', onDebug);
      }
    });

    it('should not keep debug events enabled after a debug escape call', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });

      const events: string[] = [];
      const onDebug = (e: Event) => events.push((e as CustomEvent).detail.type);
      window.addEventListener('inAppBrowserEscaper:debug', onDebug);

      try {
        InAppBrowserEscaper.escape({ fallbackUrl: 'https://example.com/debug-on', debug: true });
        expect(events).toContain('escape:start');

        document.querySelectorAll('[style*="z-index: 999999"]').forEach(el => el.remove());
        events.length = 0;

        InAppBrowserEscaper.escape({ fallbackUrl: 'https://example.com/debug-off' });
        const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
        button?.click();

        expect(events).toEqual([]);
      } finally {
        window.removeEventListener('inAppBrowserEscaper:debug', onDebug);
      }
    });

    it('should copy the URL to clipboard on the Instagram iOS tap path', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });
      const mockWriteText = jest.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      InAppBrowserEscaper.escape({ fallbackUrl: 'https://example.com/backup' });
      const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
      button.click();

      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/backup');
    });

    it('should still navigate on the Instagram iOS tap when the clipboard API is unavailable', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });
      // Simulate an iOS webview with no Clipboard API (e.g. non-secure context),
      // which forces copyUrlToClipboard down its execCommand fallback.
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      document.execCommand = jest.fn(() => true);

      const navigated: string[] = [];
      const onDebug = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.type === 'instagram-ios:set-location') {
          navigated.push(detail.escapeUrl);
        }
      };
      window.addEventListener('inAppBrowserEscaper:debug', onDebug);

      try {
        InAppBrowserEscaper.escape({ fallbackUrl: 'https://example.com/no-clip', debug: true });
        const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
        button.click();

        // The clipboard backup is best-effort; its absence must not block navigation.
        expect(navigated).toEqual([
          `instagram://extbrowser/?url=${encodeURIComponent('https://example.com/no-clip')}`,
        ]);
      } finally {
        window.removeEventListener('inAppBrowserEscaper:debug', onDebug);
      }
    });

    it('should redirect and close the modal on the non-Instagram modal button tap', () => {
      // Facebook iOS shows a modal only when explicitly requested, and uses the
      // generic performRedirect + clipboard + closeModal path, not the IG tap path.
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/1.0]',
        writable: true,
      });
      const mockWriteText = jest.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = InAppBrowserEscaper.escape({
        showModal: true,
        fallbackUrl: 'https://example.com/fb',
      });
      expect(result).toBe(true);
      expect(document.querySelector('[style*="z-index: 999999"]')).toBeTruthy();

      const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
      button.click();

      // Non-Instagram path copies the URL and closes the modal after redirecting.
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/fb');
      expect(document.querySelector('[style*="z-index: 999999"]')).toBeFalsy();
    });

    it('should show a gesture modal for Instagram iOS with default options', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23E254 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(true);
      
      // Recent Instagram iOS requires a user gesture, so default behavior is a modal.
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeTruthy();
    });

    it('should auto-redirect for Facebook iOS with default options', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/1.0]',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(true);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeFalsy();
    });

    it('should show modal when showModal is true', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ showModal: true });
      expect(result).toBe(true);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeTruthy();
    });

    it('should use custom message and buttonText when provided', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const customMessage = 'Custom message for better experience';
      const customButtonText = 'Open Now';
      
      InAppBrowserEscaper.escape({ 
        showModal: true,
        message: customMessage,
        buttonText: customButtonText
      });
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal?.innerHTML).toContain(customMessage);
      expect(modal?.innerHTML).toContain(customButtonText);
    });

    it('should auto-redirect with custom fallbackUrl when provided', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const customUrl = 'https://example.com/custom-page';
      const result = InAppBrowserEscaper.escape({ fallbackUrl: customUrl });
      
      expect(result).toBe(true);
      // The redirect would be performed with the custom URL
    });

    it('should use Instagram extbrowser scheme for Instagram iOS', () => {
      const browserInfo = {
        isInApp: true,
        platform: 'ios',
        appName: 'instagram',
        userAgent: 'Instagram 424.1.0.31.54 IABMV/1',
      };

      const redirectUrl = (InAppBrowserEscaper as any).getIOSRedirectUrl(
        'https://example.com/path?foo=bar#section',
        browserInfo
      );

      expect(redirectUrl).toBe(
        `instagram://extbrowser/?url=${encodeURIComponent('https://example.com/path?foo=bar#section')}`
      );
    });

    it('should navigate to Instagram extbrowser when the modal button is tapped', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });

      const navigated: string[] = [];
      const onDebug = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.type === 'instagram-ios:set-location') {
          navigated.push(detail.escapeUrl);
        }
      };
      window.addEventListener('inAppBrowserEscaper:debug', onDebug);

      try {
        const result = InAppBrowserEscaper.escape({
          fallbackUrl: 'https://example.com/from-modal',
          debug: true,
        });
        expect(result).toBe(true);

        const button = document.querySelector('#escaper-open-btn') as HTMLButtonElement;
        expect(button).toBeTruthy();

        // Nothing navigates until the user actually taps.
        expect(navigated).toEqual([]);

        button.click();

        // Navigation happens synchronously inside the tap to preserve the iOS gesture.
        expect(navigated).toEqual([
          `instagram://extbrowser/?url=${encodeURIComponent('https://example.com/from-modal')}`,
        ]);
      } finally {
        window.removeEventListener('inAppBrowserEscaper:debug', onDebug);
      }
    });

    it('should keep x-safari scheme for non-Instagram iOS apps', () => {
      const browserInfo = {
        isInApp: true,
        platform: 'ios',
        appName: 'facebook',
        userAgent: 'FBAN/FBIOS',
      };

      const redirectUrl = (InAppBrowserEscaper as any).getIOSRedirectUrl(
        'https://example.com/path',
        browserInfo
      );

      expect(redirectUrl).toBe('x-safari-https://example.com/path');
    });

    it('should work with force option even when not in in-app browser', () => {
      // Regular browser - should normally return false
      expect(InAppBrowserDetector.isInAppBrowser()).toBe(false);
      
      // But with force: true, it should still attempt to redirect
      const result = InAppBrowserEscaper.escape({ force: true });
      expect(result).toBe(true);
      
      // Should NOT show quick instructions overlay by default
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeFalsy();
    });

    it('should use force mode with fallbackUrl', () => {
      const customUrl = 'https://example.com/custom-page';
      const result = InAppBrowserEscaper.escape({ 
        force: true, 
        fallbackUrl: customUrl 
      });
      
      expect(result).toBe(true);
      
      // Should NOT show quick instructions overlay by default
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeFalsy();
    });

    it('should show quick instructions when explicitly requested', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.58 Mobile Safari/537.36',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ 
        showQuickInstructions: true,
        fallbackUrl: 'https://example.com'
      });
      
      expect(result).toBe(true);
      
      expect(document.body.textContent).toContain('Tap the menu');
      expect(document.body.textContent).toContain('copy the URL from the address bar');
      expect(document.querySelector('#escaper-open-btn')).toBeFalsy();
    });

    it('should combine force with showQuickInstructions', () => {
      // Regular browser
      expect(InAppBrowserDetector.isInAppBrowser()).toBe(false);
      
      const result = InAppBrowserEscaper.escape({ 
        force: true,
        showQuickInstructions: true,
        fallbackUrl: 'https://example.com'
      });
      
      expect(result).toBe(true);
      
      // Should show quick instructions overlay
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeTruthy();
    });

    it('should show only the Instagram iOS modal in force mode without an active user gesture', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ 
        force: true,
        showModal: true,
        showQuickInstructions: true
      });
      
      expect(result).toBe(true);
      
      // Instagram iOS cannot escape from page load or another async path without
      // losing the user gesture, so force mode falls back to the modal.
      const overlays = document.querySelectorAll('[style*="z-index: 999999"]');
      expect(overlays).toHaveLength(1);
      expect(document.querySelector('#escaper-open-btn')).toBeTruthy();
      expect(document.body.textContent).not.toContain('URL copied to clipboard!');
    });

    it('should navigate to Instagram extbrowser in force mode with an active user gesture', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
        writable: true,
      });
      Object.defineProperty(window.navigator, 'userActivation', {
        value: { isActive: true },
        writable: true,
        configurable: true,
      });

      const navigated: string[] = [];
      const onDebug = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.type === 'instagram-ios:set-location') {
          navigated.push(detail.escapeUrl);
        }
      };
      window.addEventListener('inAppBrowserEscaper:debug', onDebug);

      try {
        const result = InAppBrowserEscaper.escape({
          force: true,
          fallbackUrl: 'https://example.com',
          debug: true,
        });
        expect(result).toBe(true);

        // force mode reuses the same Instagram iOS tap path during a real user gesture.
        expect(navigated).toEqual([
          `instagram://extbrowser/?url=${encodeURIComponent('https://example.com')}`,
        ]);
      } finally {
        window.removeEventListener('inAppBrowserEscaper:debug', onDebug);
      }
    });
  });

  describe('copyUrlToClipboard', () => {
    it('should copy current URL to clipboard', async () => {
      const mockWriteText = jest.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const result = await InAppBrowserEscaper.copyUrlToClipboard();
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
    });

    it('should copy custom URL to clipboard', async () => {
      const mockWriteText = jest.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const customUrl = 'https://custom.com';
      const result = await InAppBrowserEscaper.copyUrlToClipboard(customUrl);
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(customUrl);
    });

    it('should fallback to execCommand when clipboard API fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn(() => Promise.reject()) },
        writable: true,
      });

      const mockExecCommand = jest.fn(() => true);
      document.execCommand = mockExecCommand;

      const result = await InAppBrowserEscaper.copyUrlToClipboard();
      expect(result).toBe(true);
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });
});
