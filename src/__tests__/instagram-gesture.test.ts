import { InAppBrowserEscaper } from '../index';

describe('In-app browser escape user activation', () => {
  const url = 'https://example.com/path?q=hello&next=/article#section';
  let navigate: jest.Mock;
  let performRedirect: jest.SpyInstance;

  beforeEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 Instagram 424.1.0.31.54 IABMV/1',
      configurable: true,
    });
    jest.clearAllMocks();

    navigate = jest.fn();
    performRedirect = jest.spyOn(InAppBrowserEscaper as any, 'performRedirect');
    // jsdom exposes href as non-configurable on Location. Spy on its backing
    // implementation setter to capture actual assignments without navigating.
    const implementationSymbol = Object.getOwnPropertySymbols(window.location)
      .find(symbol => symbol.description === 'impl');
    if (!implementationSymbol) throw new Error('jsdom Location implementation not found');
    const locationImplementation = (window.location as any)[implementationSymbol];
    jest.spyOn(locationImplementation, 'href', 'set').mockImplementation(navigate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (navigator as any).userActivation;
    document.body.innerHTML = '';
  });

  it.each([undefined, false])('hands off synchronously with active activation and showModal=%s', showModal => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: true }, configurable: true,
    });

    expect(InAppBrowserEscaper.escape({ fallbackUrl: url, showModal, debug: true })).toBe(true);

    // Inspect immediately: navigation must be initiated before escape() returns.
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(url)}`);
    expect(performRedirect).not.toHaveBeenCalled();
    expect(document.querySelector('#escaper-open-btn')).toBeNull();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
  });

  it.each([undefined, false])('hands off synchronously with debug=%s', debug => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: true }, configurable: true,
    });
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const dispatchEvent = jest.spyOn(window, 'dispatchEvent');

    expect(InAppBrowserEscaper.escape({ fallbackUrl: url, debug })).toBe(true);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(url)}`);
    expect(performRedirect).not.toHaveBeenCalled();
    expect(document.querySelector('#escaper-open-btn')).toBeNull();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'Instagram Android',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36 Instagram 424.1.0.31.54',
      platform: 'android',
      appName: 'instagram',
      redirectUrl: `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`,
    },
    {
      name: 'Facebook iOS',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/500.0.0.0.0]',
      platform: 'ios',
      appName: 'facebook',
      redirectUrl: url.replace(/^https?:\/\//, 'x-safari-https://'),
    },
  ])('keeps the generic redirect for $name during active activation', ({ userAgent, platform, appName, redirectUrl }) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: userAgent, configurable: true,
    });
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: true }, configurable: true,
    });

    expect(InAppBrowserEscaper.escape({ fallbackUrl: url })).toBe(true);

    expect(performRedirect).toHaveBeenCalledTimes(1);
    expect(performRedirect).toHaveBeenCalledWith(url, {
      isInApp: true, platform, appName, userAgent,
    });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(redirectUrl);
    expect(document.querySelector('#escaper-open-btn')).toBeNull();
  });

  it.each([
    { isActive: false, hasBeenActive: false },
    { isActive: false, hasBeenActive: true },
    undefined,
  ])('keeps the modal without current activation: %j', activation => {
    Object.defineProperty(navigator, 'userActivation', {
      value: activation, configurable: true,
    });

    expect(InAppBrowserEscaper.escape({ fallbackUrl: url, showModal: false, debug: true })).toBe(true);
    expect(document.querySelector('#escaper-open-btn')).not.toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(performRedirect).not.toHaveBeenCalled();
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('honors an explicit modal even during active activation', () => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: true }, configurable: true,
    });

    expect(InAppBrowserEscaper.escape({ fallbackUrl: url, showModal: true, debug: true })).toBe(true);
    expect(document.querySelector('#escaper-open-btn')).not.toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(performRedirect).not.toHaveBeenCalled();
  });
});
