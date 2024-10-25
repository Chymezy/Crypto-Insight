import type { User } from './index';

export type { User };

// You can add any user-specific types here if needed
export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  // ... other user settings
}
