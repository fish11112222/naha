// Shared storage utility for Vercel serverless functions
// This provides persistent storage across function invocations

interface Message {
  id: number;
  content: string;
  username: string;
  userId: number;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

// Use a global object that persists across all serverless function calls
const STORAGE_KEYS = {
  MESSAGES: 'vercel-shared-messages',
  USERS: 'vercel-shared-users', 
  THEMES: 'vercel-shared-themes',
  CURRENT_THEME: 'vercel-shared-current-theme'
} as const;

// Initialize default data
const DEFAULT_MESSAGES: Message[] = [
  {
    id: 1,
    content: "สวัสดีครับ ยินดีต้อนรับสู่ห้องแชท!",
    username: "Panida ใสใจ",
    userId: 18581680,
    createdAt: "2025-07-22T12:00:00.000Z",
    updatedAt: null,
    attachmentUrl: null,
    attachmentType: null,
    attachmentName: null
  },
  {
    id: 2,
    content: "สวัสดีครับ ผมชื่อ Kuy",
    username: "kuyyy",
    userId: 71157855,
    createdAt: "2025-07-23T03:10:00.000Z",
    updatedAt: null,
    attachmentUrl: null,
    attachmentType: null,
    attachmentName: null
  },
  {
    id: 3,
    content: "แอปนี้ทำงานได้ดีมากเลย!",
    username: "Panida ใสใจ",
    userId: 18581680,
    createdAt: "2025-07-23T03:15:00.000Z",
    updatedAt: null,
    attachmentUrl: null,
    attachmentType: null,
    attachmentName: null
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 18581680,
    username: "Panida ใสใจ",
    email: "panida@email.com",
    firstName: "Panida",
    lastName: "ใสใจ",
    bio: "ชอบการแชทและเข้าสังคม",
    location: "กรุงเทพฯ",
    website: "",
    avatarUrl: null,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: "2025-07-20T10:00:00.000Z"
  },
  {
    id: 71157855,
    username: "kuyyy",
    email: "kuy@gmail.com",
    firstName: "Kuy",
    lastName: "Kuy",
    bio: "นักพัฒนาซอฟต์แวร์",
    location: "เชียงใหม่",
    website: "",
    avatarUrl: null,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: "2025-07-21T15:30:00.000Z"
  }
];

const DEFAULT_THEMES: Theme[] = [
  {
    id: "blue",
    name: "Classic Blue",
    primary: "hsl(221.2, 83.2%, 53.3%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(221.2, 83.2%, 53.3%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)"
  },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "hsl(24.6, 95%, 53.1%)",
    secondary: "hsl(60, 4.8%, 95.9%)",
    accent: "hsl(24.6, 95%, 53.1%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(20, 14.3%, 4.1%)"
  },
  {
    id: "green",
    name: "Forest Green",
    primary: "hsl(142.1, 76.2%, 36.3%)",
    secondary: "hsl(138, 76%, 97%)",
    accent: "hsl(142.1, 76.2%, 36.3%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(237, 13%, 13%)"
  }
];

// Storage functions
export function getMessages(): Message[] {
  if (!(global as any)[STORAGE_KEYS.MESSAGES]) {
    (global as any)[STORAGE_KEYS.MESSAGES] = [...DEFAULT_MESSAGES];
  }
  return (global as any)[STORAGE_KEYS.MESSAGES];
}

export function saveMessages(messages: Message[]): void {
  (global as any)[STORAGE_KEYS.MESSAGES] = messages;
  // Also update legacy global for backward compatibility
  if ((global as any).globalMessages !== undefined) {
    (global as any).globalMessages = messages;
  }
}

export function getUsers(): User[] {
  if (!(global as any)[STORAGE_KEYS.USERS]) {
    (global as any)[STORAGE_KEYS.USERS] = [...DEFAULT_USERS];
  }
  return (global as any)[STORAGE_KEYS.USERS];
}

export function saveUsers(users: User[]): void {
  (global as any)[STORAGE_KEYS.USERS] = users;
  // Also update legacy global for backward compatibility
  if ((global as any).vercelUsers !== undefined) {
    (global as any).vercelUsers = users;
  }
}

export function getThemes(): Theme[] {
  if (!(global as any)[STORAGE_KEYS.THEMES]) {
    (global as any)[STORAGE_KEYS.THEMES] = [...DEFAULT_THEMES];
  }
  return (global as any)[STORAGE_KEYS.THEMES];
}

export function getCurrentTheme(): string {
  if (!(global as any)[STORAGE_KEYS.CURRENT_THEME]) {
    (global as any)[STORAGE_KEYS.CURRENT_THEME] = "blue";
  }
  return (global as any)[STORAGE_KEYS.CURRENT_THEME];
}

export function setCurrentTheme(themeId: string): void {
  (global as any)[STORAGE_KEYS.CURRENT_THEME] = themeId;
}

// Helper functions
export function generateMessageId(): number {
  const messages = getMessages();
  const existingIds = messages.map(m => m.id);
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  // Generate unique ID using timestamp and random component
  const timestamp = Date.now();
  const randomComponent = Math.floor(Math.random() * 1000);
  const candidateId = Math.max(maxId + 1, timestamp % 1000000 + randomComponent);
  
  // Ensure ID is unique
  if (existingIds.includes(candidateId)) {
    return Math.max(...existingIds) + 1;
  }
  return candidateId;
}

export function generateUserId(): number {
  const users = getUsers();
  const existingIds = users.map(u => u.id);
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return maxId + 1;
}