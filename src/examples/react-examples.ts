/**
 * React Integration Examples for InAppBrowserEscaper
 * 
 * This file contains example code for integrating InAppBrowserEscaper with React.
 * To use these examples, install React as a dependency in your project.
 * 
 * npm install react react-dom
 * npm install -D @types/react @types/react-dom
 */

/*
// Example 1: Using the hook
import React from 'react';
import { useInAppBrowserEscaper } from 'inappbrowserescaper/react';

function MyComponent() {
  const { isInApp, browserInfo, escapeFromInApp, copyUrl } = useInAppBrowserEscaper();

  if (isInApp) {
    return (
      <div>
        <p>You're browsing in {browserInfo?.appName}</p>
        <button onClick={() => escapeFromInApp()}>
          Open in Browser
        </button>
        <button onClick={() => copyUrl()}>
          Copy Link
        </button>
      </div>
    );
  }

  return <div>You're in a regular browser!</div>;
}

// Example 2: Using the provider
import React from 'react';
import { InAppBrowserEscaperProvider } from 'inappbrowserescaper/react';

function App() {
  return (
    <InAppBrowserEscaperProvider
      autoEscape={true}
      escapeOptions={{
        message: 'For the best experience, please open this in your browser',
        buttonText: 'Open in Browser'
      }}
      onInAppDetected={(browserInfo) => {
        console.log('In-app browser detected:', browserInfo);
      }}
    >
      <YourAppContent />
    </InAppBrowserEscaperProvider>
  );
}

// Example 3: Using the escape button component
import React from 'react';
import { EscapeButton } from 'inappbrowserescaper/react';

function Header() {
  return (
    <header>
      <h1>My Website</h1>
      <EscapeButton 
        className="escape-btn"
        style={{ background: '#007AFF', color: 'white' }}
        escapeOptions={{
          message: 'Open this page in your default browser for the best experience'
        }}
      >
        🌐 Open in Browser
      </EscapeButton>
    </header>
  );
}
*/

// Note: Uncomment the examples above to use them in your React project
