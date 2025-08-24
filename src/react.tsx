import React,
{
  useEffect,
  useState,
} from 'react';
import InAppBrowserEscaper,
{
  InAppBrowserDetector,
  type BrowserInfo,
} from './index';

/**
 * React Hook for InAppBrowserEscaper
 */
export function useInAppBrowserEscaper() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const info = InAppBrowserDetector.analyze();
    setBrowserInfo(info);
    setIsInApp(info.isInApp);
  }, []);

  const escapeFromInApp = (options?: Parameters<typeof InAppBrowserEscaper.escape>[0]) => {
    return InAppBrowserEscaper.escape(options);
  };

  const copyUrl = async (url?: string) => {
    return await InAppBrowserEscaper.copyUrlToClipboard(url);
  };

  return {
    browserInfo,
    isInApp,
    escapeFromInApp,
    copyUrl,
  };
}

/**
 * React Component for InAppBrowserEscaper
 */
interface InAppBrowserEscaperProps {
  children?: React.ReactNode;
  autoEscape?: boolean;
  escapeOptions?: Parameters<typeof InAppBrowserEscaper.escape>[0];
  onInAppDetected?: (browserInfo: BrowserInfo) => void;
}

export const InAppBrowserEscaperProvider: React.FC<InAppBrowserEscaperProps> = ({
  children,
  autoEscape = false,
  escapeOptions,
  onInAppDetected,
}) => {
  const { browserInfo, isInApp, escapeFromInApp } = useInAppBrowserEscaper();

  useEffect(() => {
    if (isInApp && browserInfo) {
      onInAppDetected?.(browserInfo);
      
      if (autoEscape) {
        escapeFromInApp(escapeOptions);
      }
    }
  }, [
    isInApp,
    browserInfo,
    autoEscape,
    escapeOptions,
    onInAppDetected,
    escapeFromInApp
  ]);

  return <>{children}</>;
};

/**
 * React Component for showing escape button
 */
interface EscapeButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  escapeOptions?: Parameters<typeof InAppBrowserEscaper.escape>[0];
}

export const EscapeButton: React.FC<EscapeButtonProps> = ({
  className,
  style,
  children = 'Open in Browser',
  escapeOptions,
}) => {
  const { isInApp, escapeFromInApp } = useInAppBrowserEscaper();

  if (!isInApp) {
    return null;
  }

  return (
    <button
      className={className}
      style={style}
      onClick={() => escapeFromInApp(escapeOptions)}
    >
      {children}
    </button>
  );
};
