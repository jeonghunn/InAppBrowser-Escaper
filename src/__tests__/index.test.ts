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
  });

  describe('escape', () => {
    it('should return false when not in in-app browser', () => {
      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(false);
    });

    it('should auto-redirect when in in-app browser with default options', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(true);
      
      // With autoRedirect: true (default), modal should not be shown
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeFalsy();
    });

    it('should show modal when showModal is true and autoRedirect is false', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ showModal: true, autoRedirect: false });
      expect(result).toBe(true);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeTruthy();
    });

    it('should not show modal or redirect when both showModal and autoRedirect are false', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ showModal: false, autoRedirect: false });
      expect(result).toBe(false);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeFalsy();
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
        autoRedirect: false,
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

    it('should work with force option even when not in in-app browser', () => {
      // Regular browser - should normally return false
      expect(InAppBrowserDetector.isInAppBrowser()).toBe(false);
      
      // But with force: true, it should still attempt to redirect
      const result = InAppBrowserEscaper.escape({ force: true });
      expect(result).toBe(true);
      
      // Should show quick instructions overlay
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeTruthy();
    });

    it('should use force mode with fallbackUrl', () => {
      const customUrl = 'https://example.com/custom-page';
      const result = InAppBrowserEscaper.escape({ 
        force: true, 
        fallbackUrl: customUrl 
      });
      
      expect(result).toBe(true);
      
      // Should show quick instructions overlay
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeTruthy();
    });

    it('should prioritize force mode over autoRedirect and showModal', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ 
        force: true,
        autoRedirect: false,
        showModal: false
      });
      
      expect(result).toBe(true);
      
      // Should show quick instructions overlay (force mode)
      const overlay = document.querySelector('[style*="z-index: 999999"]');
      expect(overlay).toBeTruthy();
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
