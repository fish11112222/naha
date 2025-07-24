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

// Global storage declarations
declare global {
  var globalThemes: ChatTheme[] | undefined;
  var globalCurrentTheme: string | undefined;
}

// Enable CORS
function enableCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Initialize global theme storage
function getGlobalThemes(): ChatTheme[] {
  if (!global.globalThemes) {
    global.globalThemes = [
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
  }
  return global.globalThemes;
}

function getCurrentTheme(): string {
  if (!global.globalCurrentTheme) {
    global.globalCurrentTheme = "Classic Blue";
  }
  return global.globalCurrentTheme;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS first
  enableCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const themes = getGlobalThemes();
    const currentThemeName = getCurrentTheme();
    const activeTheme = themes.find(t => t.name === currentThemeName) || themes[0];
    return res.status(200).json({
      currentTheme: activeTheme,
      availableThemes: themes
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const themes = getGlobalThemes();
      // Accept theme change request
      const { themeId, themeName } = req.body;
      const selectedTheme = themes.find(t => t.id === themeId || t.name === themeName);
      
      if (!selectedTheme) {
        return res.status(400).json({ message: 'ไม่พบธีมที่เลือก' });
      }
      
      // Update current theme in global storage
      global.globalCurrentTheme = selectedTheme.name;
      
      return res.status(200).json({
        message: 'เปลี่ยนธีมเรียบร้อยแล้ว',
        currentTheme: selectedTheme,
        availableThemes: themes
      });
    } catch (error) {
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนธีม' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}