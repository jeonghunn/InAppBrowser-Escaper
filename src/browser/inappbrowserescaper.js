/**
 * InAppBrowserEscaper - Browser Compatible Version
 * A TypeScript library to help users escape from in-app browsers
 */
(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // CommonJS
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define([], factory);
    } else {
        // Browser globals
        global.InAppBrowserEscaper = factory();
    }
})(typeof window !== "undefined" ? window : this, function () {
    "use strict";

    /**
     * Detects if the current browsing session is within an in-app browser
     */
    class InAppBrowserDetector {
        static IN_APP_PATTERNS = {
            instagram: /instagram/i,
            facebook: /FBAN|FBAV|FB_IAB/i,
            twitter: /TwitterAndroid|Twitter for iPhone/i,
            telegram: /TelegramBot/i,
            whatsapp: /WhatsApp/i,
            snapchat: /Snapchat/i,
            tiktok: /musical_ly|TikTok/i,
            linkedin: /LinkedInApp/i,
            wechat: /MicroMessenger/i,
            line: /Line/i,
            kakaotalk: /KAKAOTALK/i,
        };

        /**
         * Analyzes the current browser environment
         */
        static analyze() {
            const userAgent = navigator.userAgent;
            
            for (const [appName, pattern] of Object.entries(this.IN_APP_PATTERNS)) {
                if (pattern.test(userAgent)) {
                    return {
                        isInApp: true,
                        platform: this.getPlatform(),
                        userAgent,
                        appName,
                    };
                }
            }

            return {
                isInApp: false,
                platform: this.getPlatform(),
                userAgent,
            };
        }

        /**
         * Checks if currently in an in-app browser
         */
        static isInAppBrowser() {
            return this.analyze().isInApp;
        }

        /**
         * Gets the detected app name if in an in-app browser
         */
        static getAppName() {
            return this.analyze().appName;
        }

        static getPlatform() {
            const ua = navigator.userAgent;
            if (/android/i.test(ua)) return 'android';
            if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
            if (/Windows/.test(ua)) return 'windows';
            if (/Mac/.test(ua)) return 'mac';
            if (/Linux/.test(ua)) return 'linux';
            return 'unknown';
        }
    }

    /**
     * Provides escape utilities for in-app browsers
     */
    class InAppBrowserEscaper {
        static defaultOptions = {
            message: 'For the best experience, please open this in your browser',
            buttonText: 'Open in Browser',
            showModal: true,
            autoRedirect: false,
        };

        /**
         * Attempts to escape from the in-app browser
         */
        static escape(options = {}) {
            const browserInfo = InAppBrowserDetector.analyze();
            
            if (!browserInfo.isInApp) {
                return false; // Already in a regular browser
            }

            const config = { ...this.defaultOptions, ...options };
            const currentUrl = config.fallbackUrl || window.location.href;

            if (config.autoRedirect) {
                this.performRedirect(currentUrl, browserInfo);
                return true;
            }

            if (config.showModal) {
                this.showEscapeModal(currentUrl, config, browserInfo);
                return true;
            }

            return false;
        }

        /**
         * Shows a modal with escape instructions
         */
        static showEscapeModal(url, options, browserInfo) {
            const modal = this.createModal(url, options, browserInfo);
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        }

        /**
         * Creates the escape modal element
         */
        static createModal(url, options, browserInfo) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                margin: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;

            const instructions = this.getEscapeInstructions(browserInfo);
            
            content.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333;">Better Experience Available</h3>
                <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">${options.message}</p>
                <div style="margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; font-size: 14px; color: #555;">
                    ${instructions}
                </div>
                <div style="margin-top: 20px;">
                    <button id="escaper-open-btn" style="
                        background: #007AFF;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">${options.buttonText}</button>
                    <button id="escaper-close-btn" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;

            modal.appendChild(content);

            // Add event listeners
            const openBtn = content.querySelector('#escaper-open-btn');
            const closeBtn = content.querySelector('#escaper-close-btn');

            openBtn?.addEventListener('click', () => {
                this.performRedirect(url, browserInfo);
                this.closeModal(modal);
            });

            closeBtn?.addEventListener('click', () => {
                this.closeModal(modal);
            });

            return modal;
        }

        /**
         * Gets platform-specific escape instructions
         */
        static getEscapeInstructions(browserInfo) {
            if (browserInfo.platform === 'ios') {
                return `
                    <strong>On iOS:</strong><br>
                    1. Tap the share button<br>
                    2. Select "Open in Safari"<br>
                    3. Or copy the link and paste in Safari
                `;
            } else if (browserInfo.platform === 'android') {
                return `
                    <strong>On Android:</strong><br>
                    1. Tap the three dots menu<br>
                    2. Select "Open in browser"<br>
                    3. Or copy the link and paste in your browser
                `;
            } else {
                return `
                    <strong>To open in your browser:</strong><br>
                    1. Look for the "Open in browser" option<br>
                    2. Or copy this link and paste it in your browser
                `;
            }
        }

        /**
         * Performs the redirect to open in external browser
         */
        static performRedirect(url, browserInfo) {
            try {
                if (browserInfo.platform === 'ios') {
                    window.location.href = url;
                } else if (browserInfo.platform === 'android') {
                    window.open(url, '_blank');
                } else {
                    window.open(url, '_blank') || (window.location.href = url);
                }
            } catch (error) {
                console.warn('InAppBrowserEscaper: Redirect failed, falling back to location change');
                window.location.href = url;
            }
        }

        /**
         * Closes the escape modal
         */
        static closeModal(modal) {
            modal.remove();
        }

        /**
         * Utility method to copy URL to clipboard
         */
        static async copyUrlToClipboard(url) {
            const urlToCopy = url || window.location.href;
            
            try {
                await navigator.clipboard.writeText(urlToCopy);
                return true;
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = urlToCopy;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const success = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return success;
                } catch (fallbackError) {
                    document.body.removeChild(textArea);
                    return false;
                }
            }
        }
    }

    // Return the exports for the UMD pattern
    return {
        InAppBrowserDetector: InAppBrowserDetector,
        InAppBrowserEscaper: InAppBrowserEscaper,
        default: InAppBrowserEscaper
    };
});
