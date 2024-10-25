export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  walletAddresses?: {[key: string]: string};
  createdAt?: string;
  preferredCurrency?: string;
  // ... other properties
}

// You can add any user-specific types here if needed
export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  // ... other user settings
}
