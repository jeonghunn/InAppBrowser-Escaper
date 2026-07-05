# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-05

### Changed
- Improved Instagram iOS escape behavior by preserving the required user tap gesture, showing a gesture-preserving modal when needed, and using Instagram's external-browser handoff URL from the modal button.
- Updated force-mode behavior so Instagram iOS avoids blocked automatic redirects unless an active user gesture is available.
- Updated README and vanilla examples to document the current default escape behavior and Instagram iOS handling.

### Fixed
- Scoped debug mode to each `escape()` call so a previous `{ debug: true }` call no longer causes later normal calls to emit `inAppBrowserEscaper:debug` events.
- Added a regression test for debug mode not leaking across multiple `escape()` calls.
- Updated CI security audits to check runtime dependencies while ignoring dev-only audit noise.

### Added
- Added browser-visible debug events and demo-page debug logging for easier mobile in-app browser testing.
- Added demo controls for testing the Instagram library escape path and related iOS URL-scheme behavior.

## [1.0.0] - 2025-11-10

### Added
- Initial release of InAppBrowserEscaper
- Core detection functionality for popular in-app browsers
- Auto-redirect capability for seamless user experience
- Customizable escape modal with platform-specific instructions
- URL copying functionality with clipboard API and fallback
- TypeScript support with comprehensive type definitions
- React integration with hooks and components
- Angular integration with services and directives
- Comprehensive test suite with Jest
- Detailed documentation and examples
- Demo page for testing functionality

### Features
- **Zero Dependencies**: Lightweight core library
- **Framework Agnostic**: Works with any JavaScript framework
- **Mobile Optimized**: Designed specifically for mobile in-app browsers
- **TypeScript First**: Full TypeScript support with strict typing
- **Customizable UI**: Flexible modal styling and messaging
- **Multiple Strategies**: Auto-redirect, modal, or manual triggering

### Browser Support
- Instagram in-app browser
- Facebook in-app browser
- Twitter in-app browser
- Telegram in-app browser
- LinkedIn in-app browser
- Line in-app browser
- KakaoTalk in-app browser
- Safari in-app browser (SFSafariViewController)

### Platform Support
- iOS
- Android

[1.0.0]: https://github.com/jeonghunn/InAppBrowser-Escaper
[1.0.1]: https://github.com/jeonghunn/InAppBrowser-Escaper/compare/v1.0.0...v1.0.1
