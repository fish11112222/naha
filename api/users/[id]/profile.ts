import type { VercelRequest, VercelResponse } from '@vercel/node';  
import { z } from 'zod';

// Inline type definition to avoid import issues
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

// Global declaration
declare global {
  var vercelUsers: User[] | undefined;
}

// Use same storage as other user APIs
global.vercelUsers = global.vercelUsers || [
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

// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  enableCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const userId = parseInt(id as string);
  const users = global.vercelUsers || [];

  if (req.method === 'GET') {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }

    // Return user without password
    const { password, ...safeUser } = user;
    return res.status(200).json(safeUser);
  }

  if (req.method === 'PUT') {
    try {
      // Handle different body parsing scenarios in Vercel
      let requestBody = req.body;
      if (typeof req.body === 'string') {
        try {
          requestBody = JSON.parse(req.body);
        } catch (e) {
          return res.status(400).json({ message: 'รูปแบบข้อมูลไม่ถูกต้อง' });
        }
      }
      
      // Additional validation to ensure we have the required fields
      if (!requestBody || typeof requestBody !== 'object') {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
      }

      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
      }

      // Update user profile
      const updatedUser = { ...users[userIndex], ...requestBody };
      users[userIndex] = updatedUser;
      
      // Update global storage
      global.vercelUsers = users;

      // Return user without password
      const { password, ...safeUser } = updatedUser;
      return res.status(200).json({ 
        ...safeUser, 
        message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว' 
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}