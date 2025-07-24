import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { getGlobalStore } from '../../shared-storage';

// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Use shared global store
const globalStore = getGlobalStore();
const messages = globalStore.messages;

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
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({ message: 'ไม่พบข้อความ' });
      }
      
      // Update the message in global store
      globalStore.messages[messageIndex].content = validatedData.content;
      globalStore.messages[messageIndex].updatedAt = new Date().toISOString();
      globalStore.lastModified = Date.now();
      
      return res.status(200).json({ 
        ...globalStore.messages[messageIndex], 
        message: 'แก้ไขข้อความเรียบร้อยแล้ว' 
      });
    }
    
    if (req.method === 'DELETE') {
      // Get userId from query parameters instead of body for Vercel compatibility
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: 'ต้องระบุ User ID' });
      }
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({ message: 'ไม่พบข้อความ' });
      }
      
      // Check if user owns this message
      if (messages[messageIndex].userId !== userId) {
        return res.status(403).json({ message: 'คุณไม่สามารถลบข้อความของผู้อื่นได้' });
      }
      
      // Remove the message from global store and update timestamp
      globalStore.messages.splice(messageIndex, 1);
      globalStore.lastModified = Date.now();
      
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