# InAppBrowserEscaper

[![npm version](https://badge.fury.io/js/inappbrowserescaper.svg)](https://www.npmjs.com/package/inappbrowserescaper)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight TypeScript library that helps users escape from in-app browsers (Instagram, Facebook, Telegram, etc.) to their default browser for a better browsing experience.

## 🚀 Features

- **Zero Dependencies**: Lightweight with no external dependencies
- **TypeScript Support**: Fully typed with comprehensive TypeScript definitions
- **Framework Agnostic**: Works with React, Angular, Vue, or vanilla JavaScript
- **Mobile Optimized**: Specifically designed for mobile in-app browsers
- **Customizable UI**: Flexible escape modal with customizable styling
- **Multiple Strategies**: Auto-redirect, modal display, or manual trigger options
- **Comprehensive Detection**: Detects 10+ popular in-app browsers

## 📱 Supported In-App Browsers

- Instagram (iOS ✅, Android ✅)
- Facebook (iOS ✅, Android )
- Facebook Messanger (iOS ❌, Android ✅)
- Telegram (iOS ✅, Android ❌)
- Snapchat (iOS ❌, Android ❌)
- LinkedIn (iOS ✅, Android ❌)
- Line (iOS ✅, Android ✅)
- KakaoTalk (iOS ✅, Android ✅)
- Chrome Custom Tab (Android ❌)

## 📦 Installation

### npm/yarn

```bash
npm install inappbrowserescaper
```

```bash
yarn add inappbrowserescaper
```

### CDN (Browser)

```html
<!-- Include from your own hosting -->
<script src="path/to/inappbrowserescaper/dist/browser/inappbrowserescaper.js"></script>

<!-- Or use a CDN when published -->
<script src="https://unpkg.com/inappbrowserescaper/dist/browser/inappbrowserescaper.js"></script>
```

## 🔧 Quick Start

### Browser Usage (CDN/Direct Include)

For direct browser usage without a build system:

```html
<script src="path/to/dist/browser/inappbrowserescaper.js"></script>
<script>
  const { InAppBrowserDetector, InAppBrowserEscaper } = window.InAppBrowserEscaper;
  
  if (InAppBrowserDetector.isInAppBrowser()) {
    InAppBrowserEscaper.escape();
  }
</script>
```

### Module Usage (Node.js/Bundlers)

```typescript
import InAppBrowserEscaper, { InAppBrowserDetector } from 'inappbrowserescaper';

// Check if user is in an in-app browser
if (InAppBrowserDetector.isInAppBrowser()) {
  // Show escape modal
  InAppBrowserEscaper.escape({
    message: 'For the best experience, please open this in your browser',
    buttonText: 'Open in Browser'
  });
}
```

### Auto-Escape on Page Load

```typescript
document.addEventListener('DOMContentLoaded', () => {
  if (InAppBrowserDetector.isInAppBrowser()) {
    InAppBrowserEscaper.escape({
      autoRedirect: true // Automatically attempt to open in external browser
    });
  }
});
```

## 🎨 Framework Integrations

### React

```tsx
import React from 'react';
import { useInAppBrowserEscaper } from 'inappbrowserescaper/react';

function MyComponent() {
  const { isInApp, browserInfo, escapeFromInApp } = useInAppBrowserEscaper();

  if (isInApp) {
    return (
      <div>
        <p>You're browsing in {browserInfo?.appName}</p>
        <button onClick={() => escapeFromInApp()}>
          Open in Browser
        </button>
      </div>
    );
  }

  return <div>You're in a regular browser!</div>;
}
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { InAppBrowserEscaperService } from 'inappbrowserescaper/angular';

@Component({
  selector: 'app-my-component',
  template: `
    <button *ngIf="isInApp" (click)="escapeFromInApp()">
      Open in Browser
    </button>
  `
})
export class MyComponent implements OnInit {
  isInApp = false;

  constructor(private inAppBrowserService: InAppBrowserEscaperService) {}

  ngOnInit(): void {
    this.isInApp = this.inAppBrowserService.isInAppBrowser();
  }

  escapeFromInApp(): void {
    this.inAppBrowserService.escape();
  }
}
```

## 📚 API Reference

### InAppBrowserDetector

#### `analyze(): BrowserInfo`
Returns detailed information about the current browser environment.

```typescript
const browserInfo = InAppBrowserDetector.analyze();
console.log(browserInfo);
// {
//   isInApp: true,
//   platform: 'ios',
//   userAgent: '...',
//   appName: 'instagram'
// }
```

#### `isInAppBrowser(): boolean`
Quick check to determine if currently in an in-app browser.

#### `getAppName(): string | undefined`
Returns the detected app name if in an in-app browser.

### InAppBrowserEscaper

#### `escape(options?: EscapeOptions): boolean`
Attempts to help the user escape from the in-app browser.

**Options:**
- `message?: string` - Custom message to display (default: "For the best experience, please open this in your browser")
- `buttonText?: string` - Custom button text (default: "Open in Browser")
- `showModal?: boolean` - Whether to show the escape modal (default: true)
- `autoRedirect?: boolean` - Attempt automatic redirect (default: false)
- `fallbackUrl?: string` - Custom URL to redirect to (default: current URL)
- `force?: boolean` - Force escape attempt even when not in an in-app browser, tries all redirect strategies and shows quick instructions (default: false)

#### `copyUrlToClipboard(url?: string): Promise<boolean>`
Copies the current or specified URL to the clipboard.

## 🎨 Customization

### Custom Modal Styling

The escape modal uses inline styles but can be customized by targeting the modal elements:

```css
/* Target the modal backdrop */
div[style*="z-index: 999999"] {
  /* Your custom styles */
}

/* Target the modal content */
div[style*="z-index: 999999"] > div {
  /* Your custom styles */
}
```

### Custom Notification Bar

```typescript
// Create a custom notification instead of using the modal
if (InAppBrowserDetector.isInAppBrowser()) {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <span>You're in an in-app browser. </span>
    <button onclick="InAppBrowserEscaper.escape()">Open in Browser</button>
  `;
  document.body.prepend(notification);
}
```

## 🔧 Configuration Examples

### E-commerce Site
```typescript
if (InAppBrowserDetector.isInAppBrowser()) {
  InAppBrowserEscaper.escape({
    message: 'For secure checkout and the best shopping experience, please open this in your browser',
    buttonText: '🛍️ Shop Securely'
  });
}
```

### Blog/Content Site
```typescript
if (InAppBrowserDetector.isInAppBrowser()) {
  InAppBrowserEscaper.escape({
    message: 'For better reading experience and full functionality, open this article in your browser',
    buttonText: '📖 Read in Browser'
  });
}
```

### Progressive Web App
```typescript
const browserInfo = InAppBrowserDetector.analyze();
if (browserInfo.isInApp && browserInfo.appName === 'instagram') {
  // Instagram has limited PWA support
  InAppBrowserEscaper.escape({
    autoRedirect: true,
    message: 'This app works best in your browser'
  });
}
```

## 🌐 Browser Support

- **iOS Safari**: Full support
- **Android Chrome**: Full support
- **Desktop Browsers**: Detection works, escape not needed
- **All Major In-App Browsers**: Comprehensive detection

## 📱 Platform-Specific Behavior

### iOS
- Uses `window.location.href` for redirects
- Provides iOS-specific escape instructions
- Supports Safari deep linking

### Android
- Uses `window.open()` with fallback to `location.href`
- Provides Android-specific escape instructions
- Works with Chrome and other browsers

## 🔧 Troubleshooting

### "Can't find variable: exports" Error

If you encounter this error when using the library directly in a browser:

1. **Use the browser-compatible build**: Use `dist/browser/inappbrowserescaper.js` instead of `dist/index.js`
2. **Access via global variable**: The library is available as `window.InAppBrowserEscaper`

```html
<!-- ✅ Correct way -->
<script src="dist/browser/inappbrowserescaper.js"></script>
<script>
  const { InAppBrowserDetector } = window.InAppBrowserEscaper;
</script>

<!-- ❌ Avoid this -->
<script src="dist/index.js"></script> <!-- CommonJS build, not browser-compatible -->
```

### Module Loading Issues

- **Node.js/Bundlers**: Use `import` statements with the main package
- **Browser without bundler**: Use the browser build with global variables
- **React/Angular**: Import framework-specific integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for better user experience in mobile in-app browsers
- Built with TypeScript for type safety and developer experience
- Designed to be framework-agnostic for maximum compatibility

## 📊 Usage Statistics

This library helps improve user experience by:
- Reducing bounce rates from in-app browsers
- Improving conversion rates for e-commerce sites
- Providing better functionality access in full browsers
- Enhancing mobile web app performance

---

Made with ❤️ for better mobile web experiences
