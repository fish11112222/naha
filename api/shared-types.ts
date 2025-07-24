// Shared type definitions for all API files
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  dateOfBirth: string | null;
  isOnline: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface Message {
  id: number;
  content: string;
  username: string;
  userId: number;
  createdAt: string;
  updatedAt: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
}

export interface ChatTheme {
  id: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  messageBackgroundSelf: string;
  messageBackgroundOther: string;
  textColor: string;
}

// Global namespace extension
declare global {
  var vercelUsers: User[] | undefined;
  var globalMessages: Message[] | undefined;
  var globalThemes: ChatTheme[] | undefined;
  var currentTheme: ChatTheme | undefined;
  var activeThemeId: number | undefined;
}

export {};