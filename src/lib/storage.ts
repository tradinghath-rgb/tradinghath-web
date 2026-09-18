// Safe localStorage wrapper to prevent "Failed to read the 'localStorage' property from 'Window': Access is denied for this document"
// This error occurs in mobile in-app webviews (Instagram, TikTok, Telegram), incognito/private tabs, or strict security settings.

const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Access denied / blocked by browser security policy
    }
    return memoryStorage[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Access denied / blocked by browser security policy
    }
    memoryStorage[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Access denied / blocked by browser security policy
    }
    delete memoryStorage[key];
  }
};
