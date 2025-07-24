// Shared storage for Vercel serverless functions
// This is a workaround for state management across function instances

interface Message {
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

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  dateOfBirth: string;
  isOnline: boolean;
  lastActivity: string;
  createdAt: string;
}

interface GlobalStore {
  messages: Message[];
  users: User[];
  currentTheme: string;
  lastModified: number;
}

// Global store declaration
declare global {
  var vercelGlobalStore: GlobalStore | undefined;
  var globalMessages: Message[] | undefined;
  var globalUsers: User[] | undefined;
  var globalTheme: string | undefined;
}

// Initialize shared storage across all Vercel functions
function initializeGlobalStore(): GlobalStore {
  // Use separate global variables for better persistence
  if (!global.globalMessages) {
    global.globalMessages = [
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
  }

  if (!global.globalUsers) {
    global.globalUsers = [
      {
        id: 18581680,
        username: "panida",
        email: "panida@gmail.com",
        firstName: "Panida",
        lastName: "ใสใจ",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=panida",
        bio: "นักพัฒนาซอฟต์แวร์ รักการเรียนรู้เทคโนโลยีใหม่ๆ",
        location: "กรุงเทพมหานคร",
        website: "https://panida.dev",
        dateOfBirth: "1995-03-15",
        isOnline: true,
        lastActivity: "2025-07-24T06:00:00.000Z",
        createdAt: "2025-07-22T10:00:00.000Z"
      },
      {
        id: 71157855,
        username: "kuyyy",
        email: "kuy@gmail.com",
        firstName: "Kuy",
        lastName: "Kuy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kuy",
        bio: "Hello world! 👋 ชื่อจริงของผมคือ กุย",
        location: "เชียงใหม่",
        website: "https://github.com/kuyyy",
        dateOfBirth: "1992-10-10",
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: "2025-07-23T03:09:13.000Z"
      }
    ];
  }

  if (!global.globalTheme) {
    global.globalTheme = "Blue";
  }

  // Create unified store object referencing global variables
  if (!global.vercelGlobalStore) {
    global.vercelGlobalStore = {
      get messages() { return global.globalMessages || []; },
      set messages(value) { global.globalMessages = value; },
      get users() { return global.globalUsers || []; },
      set users(value) { global.globalUsers = value; },
      get currentTheme() { return global.globalTheme || "Blue"; },
      set currentTheme(value) { global.globalTheme = value; },
      lastModified: Date.now()
    };
  }

  return global.vercelGlobalStore;
}

export function getGlobalStore(): GlobalStore {
  return initializeGlobalStore();
}

export function updateStore(updates: Partial<GlobalStore>): void {
  const store = getGlobalStore();
  Object.assign(store, updates);
  store.lastModified = Date.now();
}

export type { GlobalStore, Message, User };