import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline type definition to avoid import issues
interface ChatTheme {
  id: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  messageBackgroundSelf: string;
  messageBackgroundOther: string;
  textColor: string;
}

// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Initialize global theme storage
global.globalThemes = global.globalThemes || [
  {
    id: 1,
    name: "Classic Blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af", 
    backgroundColor: "#ffffff",
    messageBackgroundSelf: "#3b82f6",
    messageBackgroundOther: "#f1f5f9",
    textColor: "#1e293b"
  },
  {
    id: 2,
    name: "Sunset Orange",
    primaryColor: "#f97316",
    secondaryColor: "#ea580c",
    backgroundColor: "#ffffff", 
    messageBackgroundSelf: "#f97316",
    messageBackgroundOther: "#fed7aa",
    textColor: "#9a3412"
  },
  {
    id: 3,
    name: "Forest Green", 
    primaryColor: "#059669",
    secondaryColor: "#047857",
    backgroundColor: "#ffffff",
    messageBackgroundSelf: "#059669", 
    messageBackgroundOther: "#bbf7d0",
    textColor: "#064e3b"
  },
  {
    id: 4,
    name: "Purple Dreams",
    primaryColor: "#9333ea",
    secondaryColor: "#7c3aed",
    backgroundColor: "#ffffff",
    messageBackgroundSelf: "#9333ea",
    messageBackgroundOther: "#e9d5ff",
    textColor: "#581c87"
  }
];

global.activeThemeId = global.activeThemeId || 1;

const themes = global.globalThemes;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS first
  enableCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const activeTheme = themes.find(t => t.id === global.activeThemeId) || themes[0];
    return res.status(200).json({
      currentTheme: activeTheme,
      availableThemes: themes
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      // Accept theme change request
      const { themeId } = req.body;
      const selectedTheme = themes.find(t => t.id === themeId);
      
      if (!selectedTheme) {
        return res.status(400).json({ message: 'ไม่พบธีมที่เลือก' });
      }
      
      // Update active theme ID in global storage
      global.activeThemeId = selectedTheme.id;
      
      return res.status(200).json({
        success: true,
        message: 'เปลี่ยนธีมสำเร็จ',
        currentTheme: selectedTheme,
        availableThemes: themes
      });
    } catch (error) {
      console.error('Theme change error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนธีม' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}