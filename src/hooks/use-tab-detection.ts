import { useEffect, useState, useCallback } from 'react';

interface TabInfo {
  isActive: boolean;
  isFocused: boolean;
  isVisible: boolean;
  timestamp: number;
}

export const useTabDetection = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo>({
    isActive: true,
    isFocused: true,
    isVisible: true,
    timestamp: Date.now(),
  });

  const updateTabInfo = useCallback(() => {
    setTabInfo({
      isActive: !document.hidden,
      isFocused: document.hasFocus(),
      isVisible: document.visibilityState === 'visible',
      timestamp: Date.now(),
    });
  }, []);

  useEffect(() => {
    // Check initial state
    updateTabInfo();

    // Listen to visibility changes
    document.addEventListener('visibilitychange', updateTabInfo);
    document.addEventListener('focus', updateTabInfo);
    document.addEventListener('blur', updateTabInfo);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', updateTabInfo);
      document.removeEventListener('focus', updateTabInfo);
      document.removeEventListener('blur', updateTabInfo);
    };
  }, [updateTabInfo]);

  return tabInfo;
};

export const useTabNotification = (callback: (isActive: boolean) => void) => {
  const tabInfo = useTabDetection();

  useEffect(() => {
    callback(tabInfo.isActive);
  }, [tabInfo.isActive, callback]);

  return tabInfo;
};
