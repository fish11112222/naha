import type { VercelRequest, VercelResponse } from '@vercel/node';

interface User {
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

declare global {
  var vercelUsers: User[] | undefined;
}

function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

const initializeUsers = () => {
  if (!global.vercelUsers) {
    global.vercelUsers = [
      {
        id: 18581680,
        username: "panida",
        email: "panida@gmail.com",
        password: "12345qazAZ",
        firstName: "Panida",
        lastName: "ใสใจ",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=panida",
        bio: "รักการเขียนโปรแกรม และการสร้างแอปแชท",
        location: "กรุงเทพฯ",
        website: "https://github.com/panida",
        dateOfBirth: "1995-05-15",
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: "2025-07-22T12:00:00.000Z"
      },
      {
        id: 71157855,
        username: "kuyyy",
        email: "kuy@gmail.com",
        password: "12345qazAZ",
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
      },
      {
        id: 12345678,
        username: "admin",
        email: "admin@thaichat.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "System",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        bio: "ผู้ดูแลระบบแชทไทย",
        location: "กรุงเทพฯ",
        website: "https://thaichat.com",
        dateOfBirth: "1990-01-01",
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: "2025-07-22T10:00:00.000Z"
      }
    ];
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  enableCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      initializeUsers();
      const users = global.vercelUsers || [];
      const onlineUsers = users.filter(u => u.isOnline).map(({ password, ...user }) => user);
      return res.status(200).json(onlineUsers);
    } catch (error) {
      console.error('Online users error:', error);
      return res.status(500).json({ message: 'Failed to fetch online users' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}