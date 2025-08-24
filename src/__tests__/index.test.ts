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

    it('should show modal when in in-app browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape();
      expect(result).toBe(true);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeTruthy();
    });

    it('should not show modal when showModal is false', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Instagram',
        writable: true,
      });

      const result = InAppBrowserEscaper.escape({ showModal: false });
      expect(result).toBe(false);
      
      const modal = document.querySelector('[style*="z-index: 999999"]');
      expect(modal).toBeFalsy();
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
