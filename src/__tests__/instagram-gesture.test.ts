import { InAppBrowserEscaper } from '../index';

describe('Instagram iOS escape user activation', () => {
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
