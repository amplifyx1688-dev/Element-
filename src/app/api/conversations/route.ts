import { NextRequest, NextResponse } from "next/server";

// In-memory storage for scraped conversations (in production, use a database)
let scrapedConversations: {
  id: string;
  customerName: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  platform: string;
  messages?: {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isIncoming: boolean;
  }[];
}[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform, conversations, messages } = body;

    if (action === "import") {
      // Import scraped conversations
      if (!conversations || !Array.isArray(conversations)) {
        return NextResponse.json(
          { error: "Invalid conversations data" },
          { status: 400 }
        );
      }

      // Merge with existing conversations (avoid duplicates by id)
      const existingIds = new Set(scrapedConversations.map(c => c.id));
      const newConversations = conversations.filter(c => !existingIds.has(c.id));
      scrapedConversations = [...scrapedConversations, ...newConversations];

      return NextResponse.json({
        success: true,
        message: `已匯入 ${newConversations.length} 個對話`,
        total: scrapedConversations.length,
      });
    }

    if (action === "importMessages") {
      // Import messages for a specific conversation
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json(
          { error: "Invalid messages data" },
          { status: 400 }
        );
      }

      const { conversationId } = body;
      if (!conversationId) {
        return NextResponse.json(
          { error: "conversationId is required" },
          { status: 400 }
        );
      }

      // Find and update the conversation with new messages
      const convIndex = scrapedConversations.findIndex(c => c.id === conversationId);
      if (convIndex === -1) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      scrapedConversations[convIndex].messages = messages;

      return NextResponse.json({
        success: true,
        message: `已匯入 ${messages.length} 則訊息`,
      });
    }

    if (action === "getAll") {
      // Return all scraped conversations
      return NextResponse.json({
        success: true,
        conversations: scrapedConversations,
      });
    }

    if (action === "clear") {
      // Clear all scraped conversations
      scrapedConversations = [];
      return NextResponse.json({
        success: true,
        message: "已清除所有對話",
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    conversations: scrapedConversations,
    count: scrapedConversations.length,
  });
}
