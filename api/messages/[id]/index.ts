import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Type definitions
type Message = {
  id: number;
  content: string;
  username: string;
  userId: number;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string | null;
};

// Global storage declarations
declare global {
  var globalMessages: Message[] | undefined;
}

// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Initialize and get messages
function getMessages(): Message[] {
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
  return global.globalMessages;
}

const updateMessageSchema = z.object({
  content: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS first
  enableCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const messageId = parseInt(req.query.id as string);
  
  if (isNaN(messageId)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  try {
    if (req.method === 'PUT') {
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
      
      const validatedData = updateMessageSchema.parse(requestBody);
      
      const messages = getMessages();
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({ message: 'ไม่พบข้อความ' });
      }
      
      // Update the message in global storage
      const currentMessages = getMessages();
      currentMessages[messageIndex].content = validatedData.content;
      currentMessages[messageIndex].updatedAt = new Date().toISOString();
      
      return res.status(200).json({ 
        ...currentMessages[messageIndex], 
        message: 'แก้ไขข้อความเรียบร้อยแล้ว' 
      });
    }
    
    if (req.method === 'DELETE') {
      // Get userId from query parameters instead of body for Vercel compatibility
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: 'ต้องระบุ User ID' });
      }
      
      const messages = getMessages();
      console.log(`Looking for message ID ${messageId} in ${messages.length} messages`);
      console.log('Available message IDs:', messages.map(m => m.id));
      console.log('Global messages count:', global.globalMessages?.length || 0);
      console.log('Store messages count:', globalStore.messages.length);
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({ 
          message: 'ไม่พบข้อความ',
          debug: {
            requestedId: messageId,
            availableIds: messages.map(m => m.id),
            messageCount: messages.length,
            globalCount: global.globalMessages?.length || 0,
            storeCount: globalStore.messages.length
          }
        });
      }
      
      // Check if user owns this message
      if (messages[messageIndex].userId !== userId) {
        return res.status(403).json({ message: 'คุณไม่สามารถลบข้อความของผู้อื่นได้' });
      }
      
      console.log(`Deleting message ${messageId} by user ${userId}`);
      // Remove the message from global storage
      const currentMessages = getMessages();
      currentMessages.splice(messageIndex, 1);
      
      console.log(`Message deleted. Remaining: ${currentMessages.length} messages`);
      return res.status(204).end();
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "ข้อมูลไม่ถูกต้อง", 
        errors: error.errors 
      });
    }
    
    console.error('Message operation error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
}