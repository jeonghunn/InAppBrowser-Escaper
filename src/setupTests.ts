// Jest setup file
// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
    },
  },
  writable: true,
});

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(() => true),
  writable: true,
});
