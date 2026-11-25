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

  describe.each([
    { state: 'active', activation: { isActive: true, hasBeenActive: true } },
    { state: 'inactive', activation: { isActive: false, hasBeenActive: true } },
    { state: 'unavailable', activation: undefined },
  ])('when user activation is $state', ({ activation }) => {
    beforeEach(() => {
      if (activation !== undefined) {
        Object.defineProperty(navigator, 'userActivation', {
          value: activation, configurable: true,
        });
      }
    });

    it.each([
      {},
      { showModal: false },
      { force: true },
      { force: true, showModal: false },
      { force: true, showModal: true },
    ])('attempts navigation synchronously for %j', options => {
      expect(InAppBrowserEscaper.escape({ fallbackUrl: url, ...options })).toBe(true);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(url)}`);
      expect(performRedirect).not.toHaveBeenCalled();
      expect(document.querySelector('#escaper-open-btn')).toBeNull();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('waits for the modal button when showModal is true', () => {
      expect(InAppBrowserEscaper.escape({ fallbackUrl: url, showModal: true })).toBe(true);

      const button = document.querySelector<HTMLButtonElement>('#escaper-open-btn');
      expect(button).not.toBeNull();
      expect(navigate).not.toHaveBeenCalled();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

      button?.click();

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(url)}`);
      expect(performRedirect).not.toHaveBeenCalled();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    });
  });

  it('attempts navigation during the modal click even when copying is unavailable', () => {
    const browser: { clipboard?: Clipboard } = navigator;
    jest.replaceProperty(browser, 'clipboard', undefined);
    const copyFallback = jest.spyOn(document, 'execCommand').mockReturnValueOnce(false);

    InAppBrowserEscaper.escape({ fallbackUrl: url, showModal: true });
    expect(navigate).not.toHaveBeenCalled();

    document.querySelector<HTMLButtonElement>('#escaper-open-btn')?.click();

    expect(copyFallback).toHaveBeenCalledWith('copy');
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(url)}`);
  });

  it.each([
    ['/checkout?source=instagram#payment', `${window.location.origin}/checkout?source=instagram#payment`],
    ['HTTPS://EXAMPLE.COM/checkout', 'https://example.com/checkout'],
  ])('sends the resolved fallback %s through the Instagram handoff', (fallbackUrl, destination) => {
    expect(InAppBrowserEscaper.escape({ fallbackUrl })).toBe(true);

    expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(destination)}`);
  });

  it('copies the resolved destination when the modal button is tapped', () => {
    const destination = `${window.location.origin}/checkout`;
    expect(InAppBrowserEscaper.escape({ fallbackUrl: '/checkout', showModal: true })).toBe(true);

    document.querySelector<HTMLButtonElement>('#escaper-open-btn')?.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(destination);
    expect(navigate).toHaveBeenCalledWith(`instagram://extbrowser/?url=${encodeURIComponent(destination)}`);
  });

  describe.each([
    { mode: 'direct', options: { showModal: false } },
    { mode: 'modal', options: { showModal: true } },
    { mode: 'force', options: { force: true } },
  ])('in $mode mode', ({ options }) => {
    it.each([
      ' JaVa\tScRiPt:void(0)',
      'data:text/html,hello',
      'https://[invalid]',
    ])('skips invalid or unsupported destination %s', fallbackUrl => {
      expect(InAppBrowserEscaper.escape({ ...options, fallbackUrl })).toBe(false);

      expect(navigate).not.toHaveBeenCalled();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
      expect(document.querySelector('#escaper-open-btn')).toBeNull();
    });
  });

  it('keeps input focus when a direct redirect stays on the page', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('Clipboard access denied'));
    jest.replaceProperty(navigator, 'clipboard', { ...navigator.clipboard, writeText });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);

    InAppBrowserEscaper.escape({ fallbackUrl: url, showModal: false });
    expect(navigate).toHaveBeenCalledTimes(1);
    // The navigation stub leaves the page in place. Let any clipboard rejection settle.
    await Promise.resolve();

    expect(document.activeElement).toBe(input);
    expect(writeText).not.toHaveBeenCalled();
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
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
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
});
