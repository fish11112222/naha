import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { getGlobalStore, type Message } from './shared-storage';



// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Initialize persistent store if not exists
if (!global.vercelMessageStore) {
  global.vercelMessageStore = {
    messages: [
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
    username: "Kuy Kuy",
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
    ],
    lastModified: Date.now()
  };
}

// Always use the shared store
const messageStore = global.vercelMessageStore!;
const messages = messageStore.messages;

const messageSchema = z.object({
  content: z.string().min(0, ""),  // Allow empty content for image/gif only messages
  username: z.string().min(1),
  userId: z.number(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.enum(['image', 'file', 'gif']).optional(),
  attachmentName: z.string().optional(),
}).refine((data) => {
  // Either content must be provided OR attachment must be provided
  return data.content.trim().length > 0 || (data.attachmentUrl && data.attachmentType);
}, {
  message: "กรุณาระบุข้อความหรือแนบไฟล์",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS first
  enableCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit as string) || 50;
      const paginatedMessages = messages.slice(-limit);
      return res.status(200).json(paginatedMessages);
    }
    
    if (req.method === 'POST') {
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
      
      const validatedData = messageSchema.parse(requestBody);
      
      const newMessage: Message = {
        id: Math.floor(Math.random() * 1000000),
        content: validatedData.content.trim(),
        username: validatedData.username,
        userId: validatedData.userId,
        attachmentUrl: validatedData.attachmentUrl || null,
        attachmentType: validatedData.attachmentType || null,
        attachmentName: validatedData.attachmentName || null,
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
      
      globalStore.messages.push(newMessage);
      globalStore.lastModified = Date.now();
      return res.status(201).json(newMessage);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "ข้อมูลไม่ถูกต้อง", 
        errors: error.errors 
      });
    }
    
    console.error('Messages error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
}