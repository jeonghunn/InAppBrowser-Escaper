/**
 * Vanilla JavaScript Examples for InAppBrowserEscaper
 * 
 * These examples show how to use InAppBrowserEscaper in plain JavaScript
 * or any framework that supports ES modules or CommonJS.
 */

// Example 1: Basic usage
/*
import InAppBrowserEscaper, { InAppBrowserDetector } from '@jhrunning/inappbrowserescaper';

// Check if user is in an in-app browser
if (InAppBrowserDetector.isInAppBrowser()) {
  console.log('User is in an in-app browser');
  
  // Get detailed information
  const browserInfo = InAppBrowserDetector.analyze();
  console.log('Browser info:', browserInfo);
  
  // Show escape modal automatically
  InAppBrowserEscaper.escape({
    message: 'For the best experience, please open this in your browser',
    buttonText: 'Open in Browser',
    showModal: true
  });
}
*/

// Example 2: Manual escape button
/*
// HTML: <button id="escape-btn">Open in Browser</button>

document.addEventListener('DOMContentLoaded', () => {
  const escapeBtn = document.getElementById('escape-btn');
  
  if (InAppBrowserDetector.isInAppBrowser()) {
    escapeBtn.style.display = 'block';
    escapeBtn.addEventListener('click', () => {
      InAppBrowserEscaper.escape();
    });
  } else {
    escapeBtn.style.display = 'none';
  }
});
*/

// Example 3: Auto-redirect for specific apps
/*
document.addEventListener('DOMContentLoaded', () => {
  const browserInfo = InAppBrowserDetector.analyze();
  
  if (browserInfo.isInApp) {
    // Auto-redirect for Instagram and Facebook
    if (browserInfo.appName === 'instagram' || browserInfo.appName === 'facebook') {
      InAppBrowserEscaper.escape({
        autoRedirect: true,
        showModal: false
      });
    } else {
      // Show modal for other apps
      InAppBrowserEscaper.escape({
        message: `You're browsing in ${browserInfo.appName}. For the best experience, please open this in your browser.`,
        showModal: true
      });
    }
  }
});
*/

// Example 4: Copy URL functionality
/*
// HTML: <button id="copy-url-btn">Copy Link</button>

document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copy-url-btn');
  
  copyBtn.addEventListener('click', async () => {
    const success = await InAppBrowserEscaper.copyUrlToClipboard();
    
    if (success) {
      // Show success feedback
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Link';
      }, 2000);
    } else {
      alert('Could not copy link. Please copy manually: ' + window.location.href);
    }
  });
});
*/

// Example 5: Custom styling and advanced usage
/*
document.addEventListener('DOMContentLoaded', () => {
  if (InAppBrowserDetector.isInAppBrowser()) {
    const browserInfo = InAppBrowserDetector.analyze();
    
    // Create custom notification bar
    const notificationBar = document.createElement('div');
    notificationBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b35;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notificationBar.innerHTML = `
      <span>You're browsing in ${browserInfo.appName || 'an in-app browser'}. </span>
      <button id="open-browser" style="
        background: white;
        color: #ff6b35;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        margin-left: 10px;
        cursor: pointer;
      ">Open in Browser</button>
      <button id="dismiss" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 5px 10px;
        border-radius: 4px;
        margin-left: 5px;
        cursor: pointer;
      ">×</button>
    `;
    
    document.body.prepend(notificationBar);
    
    // Add margin to body to account for notification bar
    document.body.style.marginTop = '50px';
    
    // Event listeners
    document.getElementById('open-browser').addEventListener('click', () => {
      InAppBrowserEscaper.escape();
    });
    
    document.getElementById('dismiss').addEventListener('click', () => {
      notificationBar.remove();
      document.body.style.marginTop = '0';
    });
  }
});
*/

// Example 6: Using with popular frameworks

// jQuery example:
/*
$(document).ready(function() {
  if (InAppBrowserDetector.isInAppBrowser()) {
    $('#escape-button').show().click(function() {
      InAppBrowserEscaper.escape();
    });
  }
});
*/

// Vue.js example (in a Vue component):
/*
export default {
  data() {
    return {
      isInApp: false,
      browserInfo: null
    };
  },
  mounted() {
    this.browserInfo = InAppBrowserDetector.analyze();
    this.isInApp = this.browserInfo.isInApp;
  },
  methods: {
    escapeFromInApp() {
      InAppBrowserEscaper.escape();
    }
  }
};
*/

// Note: Uncomment the examples above to use them in your project
