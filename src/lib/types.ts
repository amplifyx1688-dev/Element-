// ============================================================
// AutoReply Pro - Type Definitions
// ============================================================

export type Platform =
  | "shopee"
  | "lazada"
  | "tokopedia"
  | "facebook"
  | "instagram"
  | "line"
  | "whatsapp"
  | "telegram"
  | "custom";

export type MatchMode = "exact" | "contains" | "regex" | "fuzzy";
export type ReplyMode = "auto" | "suggest" | "manual";
export type Priority = "high" | "medium" | "low";
export type MessageStatus = "unread" | "replied" | "pending" | "ignored";

export interface PlatformConfig {
  id: string;
  platform: Platform;
  name: string;
  enabled: boolean;
  url?: string;
  selectors?: {
    messageList?: string;
    messageItem?: string;
    inputBox?: string;
    sendButton?: string;
    unreadBadge?: string;
  };
  checkInterval: number; // seconds
  color: string;
  icon: string;
}

export interface KeywordRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: Priority;
  platforms: Platform[];
  keywords: string[];
  matchMode: MatchMode;
  caseSensitive: boolean;
  contextLines: number; // how many previous messages to consider
  responses: ResponseTemplate[];
  replyMode: ReplyMode;
  delay: number; // ms delay before sending
  cooldown: number; // seconds before same rule triggers again
  tags: string[];
  stats: {
    triggered: number;
    lastTriggered?: string;
  };
}

export interface ResponseTemplate {
  id: string;
  content: string;
  weight: number; // for random selection (1-10)
  variables?: string[]; // e.g. ["{{customer_name}}", "{{order_id}}"]
}

export interface ConversationMessage {
  id: string;
  platform: Platform;
  platformName: string;
  sender: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  matchedRule?: string;
  suggestedReply?: string;
  sentReply?: string;
  isIncoming: boolean;
}

export interface AutoReplySession {
  id: string;
  platform: Platform;
  platformName: string;
  conversationId: string;
  customerName: string;
  messages: ConversationMessage[];
  status: "active" | "resolved" | "waiting";
  lastActivity: string;
  unreadCount: number;
  assignedRules: string[];
}

export interface SystemStats {
  totalReplied: number;
  totalDetected: number;
  avgResponseTime: number; // seconds
  activeConversations: number;
  todayReplied: number;
  successRate: number;
}

export interface RPAConfig {
  id: string;
  name: string;
  platform: Platform;
  enabled: boolean;
  script: string;
  triggerType: "interval" | "webhook" | "manual";
  interval?: number;
  lastRun?: string;
  status: "idle" | "running" | "error" | "success";
}

// ============================================================
// Default / Sample Data
// ============================================================

export const PLATFORM_META: Record<Platform, { label: string; color: string; icon: string }> = {
  shopee: { label: "蝦皮購物", color: "#ee4d2d", icon: "🛒" },
  lazada: { label: "Lazada", color: "#0f146d", icon: "🛍️" },
  tokopedia: { label: "Tokopedia", color: "#03ac0e", icon: "🏪" },
  facebook: { label: "Facebook", color: "#1877f2", icon: "📘" },
  instagram: { label: "Instagram", color: "#e1306c", icon: "📸" },
  line: { label: "LINE", color: "#06c755", icon: "💬" },
  whatsapp: { label: "WhatsApp", color: "#25d366", icon: "📱" },
  telegram: { label: "Telegram", color: "#2ca5e0", icon: "✈️" },
  custom: { label: "自訂平台", color: "#6366f1", icon: "🌐" },
};

export const DEFAULT_PLATFORMS: PlatformConfig[] = [
  {
    id: "p1",
    platform: "shopee",
    name: "蝦皮購物",
    enabled: true,
    url: "https://seller.shopee.tw/",
    selectors: {
      messageList: ".chat-list",
      messageItem: ".chat-item",
      inputBox: ".chat-input textarea",
      sendButton: ".send-btn",
      unreadBadge: ".unread-count",
    },
    checkInterval: 10,
    color: "#ee4d2d",
    icon: "🛒",
  },
  {
    id: "p2",
    platform: "lazada",
    name: "Lazada",
    enabled: false,
    url: "https://sellercenter.lazada.com/",
    selectors: {
      messageList: ".conversation-list, [data-testid=\"conversation-list\"]",
      messageItem: ".conversation-item, [data-testid=\"conversation-item\"]",
      inputBox: ".message-input, textarea[placeholder*=\"訊息\"]",
      sendButton: ".send-button, [data-testid=\"send-button\"]",
      unreadBadge: ".unread-badge, [data-testid=\"unread-count\"]",
    },
    checkInterval: 15,
    color: "#0f146d",
    icon: "🛍️",
  },
  {
    id: "p3",
    platform: "facebook",
    name: "Facebook Messenger",
    enabled: true,
    url: "https://www.facebook.com/messages/",
    selectors: {
      messageList: '[role="main"] [aria-label*="訊息"], .x1n2onr6',
      messageItem: '[role="main"] li, .x1n2onr6 li',
      inputBox: '[role="main"] [contenteditable="true"], .x1n2onr6 [contenteditable]',
      sendButton: '[role="main"] [aria-label="傳送"], .x1n2onr6 [aria-label="傳送"]',
      unreadBadge: '[role="main"] span[aria-label*="未讀"], .x1n2onr6 [data-pagelet]',
    },
    checkInterval: 8,
    color: "#1877f2",
    icon: "📘",
  },
  {
    id: "p4",
    platform: "line",
    name: "LINE Official",
    enabled: false,
    url: "https://manager.line.biz/",
    selectors: {
      messageList: ".message-list, [data-component=\"messageList\"]",
      messageItem: ".message-item, [data-component=\"messageItem\"]",
      inputBox: ".message-input, textarea[data-testid=\"chatInput\"]",
      sendButton: ".send-button, [data-testid=\"sendButton\"]",
      unreadBadge: ".unread-badge, [data-testid=\"unreadBadge\"]",
    },
    checkInterval: 12,
    color: "#06c755",
    icon: "💬",
  },
];

export const DEFAULT_RULES: KeywordRule[] = [
  {
    id: "r1",
    name: "詢問價格",
    enabled: true,
    priority: "high",
    platforms: ["shopee", "facebook", "line"],
    keywords: ["多少錢", "價格", "費用", "報價", "price", "how much", "幾錢"],
    matchMode: "contains",
    caseSensitive: false,
    contextLines: 3,
    responses: [
      {
        id: "resp1",
        content: "您好！感謝您的詢問 😊 我們的商品價格請參考商品頁面，如需特殊報價或批量優惠，請告知您的需求，我們會盡快為您提供最優惠的方案！",
        weight: 5,
      },
      {
        id: "resp2",
        content: "Hi！關於價格方面，請查看商品詳情頁面的標示價格。如有任何疑問歡迎繼續詢問 🙏",
        weight: 5,
      },
    ],
    replyMode: "auto",
    delay: 2000,
    cooldown: 300,
    tags: ["銷售", "詢價"],
    stats: { triggered: 142, lastTriggered: "2026-03-06T14:30:00Z" },
  },
  {
    id: "r2",
    name: "詢問庫存/現貨",
    enabled: true,
    priority: "high",
    platforms: ["shopee", "lazada", "facebook"],
    keywords: ["有貨嗎", "現貨", "庫存", "還有嗎", "in stock", "available", "有沒有"],
    matchMode: "contains",
    caseSensitive: false,
    contextLines: 2,
    responses: [
      {
        id: "resp3",
        content: "您好！目前商品有現貨，可以直接下單喔！如需確認特定規格或顏色的庫存，請告知我們 ✅",
        weight: 8,
      },
      {
        id: "resp4",
        content: "感謝詢問！商品目前有庫存，歡迎直接下單。若需要大量採購請提前告知，我們會為您保留庫存 📦",
        weight: 2,
      },
    ],
    replyMode: "auto",
    delay: 1500,
    cooldown: 180,
    tags: ["庫存", "銷售"],
    stats: { triggered: 89, lastTriggered: "2026-03-06T13:45:00Z" },
  },
  {
    id: "r3",
    name: "詢問運送/配送",
    enabled: true,
    priority: "medium",
    platforms: ["shopee", "lazada", "tokopedia"],
    keywords: ["運費", "配送", "幾天到", "快遞", "shipping", "delivery", "幾天", "到貨"],
    matchMode: "contains",
    caseSensitive: false,
    contextLines: 2,
    responses: [
      {
        id: "resp5",
        content: "您好！一般配送時間為 2-5 個工作天，偏遠地區可能需要 5-7 天。運費依重量計算，滿額免運！如需加急配送請告知 🚚",
        weight: 10,
      },
    ],
    replyMode: "suggest",
    delay: 3000,
    cooldown: 240,
    tags: ["物流", "配送"],
    stats: { triggered: 67, lastTriggered: "2026-03-06T12:20:00Z" },
  },
  {
    id: "r4",
    name: "退換貨詢問",
    enabled: true,
    priority: "high",
    platforms: ["shopee", "lazada", "facebook"],
    keywords: ["退貨", "換貨", "退款", "壞掉", "瑕疵", "問題", "refund", "return", "exchange"],
    matchMode: "contains",
    caseSensitive: false,
    contextLines: 5,
    responses: [
      {
        id: "resp6",
        content: "非常抱歉造成您的不便！🙏 關於退換貨，我們提供 7 天鑑賞期。請提供：\n1. 訂單編號\n2. 問題說明\n3. 商品照片\n\n我們會盡快為您處理！",
        weight: 10,
      },
    ],
    replyMode: "suggest",
    delay: 1000,
    cooldown: 600,
    tags: ["售後", "客服"],
    stats: { triggered: 23, lastTriggered: "2026-03-05T16:10:00Z" },
  },
  {
    id: "r5",
    name: "打招呼/問候",
    enabled: true,
    priority: "low",
    platforms: ["shopee", "facebook", "line", "instagram"],
    keywords: ["你好", "您好", "hi", "hello", "嗨", "哈囉", "早安", "午安", "晚安"],
    matchMode: "contains",
    caseSensitive: false,
    contextLines: 1,
    responses: [
      {
        id: "resp7",
        content: "您好！歡迎光臨 😊 請問有什麼可以幫助您的嗎？",
        weight: 5,
      },
      {
        id: "resp8",
        content: "Hi！感謝您的聯繫，有任何問題都可以告訴我們 🌟",
        weight: 5,
      },
    ],
    replyMode: "auto",
    delay: 1000,
    cooldown: 60,
    tags: ["問候"],
    stats: { triggered: 215, lastTriggered: "2026-03-06T14:42:00Z" },
  },
];

export const SAMPLE_CONVERSATIONS: AutoReplySession[] = [
  {
    id: "c1",
    platform: "shopee",
    platformName: "蝦皮購物",
    conversationId: "conv_001",
    customerName: "買家 小明",
    messages: [
      {
        id: "m1",
        platform: "shopee",
        platformName: "蝦皮購物",
        sender: "買家 小明",
        content: "你好！請問這個商品還有現貨嗎？",
        timestamp: "2026-03-06T14:30:00Z",
        status: "replied",
        matchedRule: "r2",
        sentReply: "您好！目前商品有現貨，可以直接下單喔！如需確認特定規格或顏色的庫存，請告知我們 ✅",
        isIncoming: true,
      },
      {
        id: "m2",
        platform: "shopee",
        platformName: "蝦皮購物",
        sender: "系統",
        content: "您好！目前商品有現貨，可以直接下單喔！如需確認特定規格或顏色的庫存，請告知我們 ✅",
        timestamp: "2026-03-06T14:30:03Z",
        status: "replied",
        isIncoming: false,
      },
      {
        id: "m3",
        platform: "shopee",
        platformName: "蝦皮購物",
        sender: "買家 小明",
        content: "好的！那運費怎麼算？",
        timestamp: "2026-03-06T14:32:00Z",
        status: "unread",
        matchedRule: "r3",
        suggestedReply: "您好！一般配送時間為 2-5 個工作天，偏遠地區可能需要 5-7 天。運費依重量計算，滿額免運！如需加急配送請告知 🚚",
        isIncoming: true,
      },
    ],
    status: "active",
    lastActivity: "2026-03-06T14:32:00Z",
    unreadCount: 1,
    assignedRules: ["r2", "r3"],
  },
];
