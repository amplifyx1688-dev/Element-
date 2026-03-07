"use client";

import { useState, useCallback } from "react";
import {
  KeywordRule,
  PlatformConfig,
  AutoReplySession,
  SystemStats,
  Platform,
  DEFAULT_PLATFORMS,
  DEFAULT_RULES,
  SAMPLE_CONVERSATIONS,
  LogEntry,
  LogLevel,
  LogCategory,
  HeartbeatStatus,
  SystemStatus,
} from "./types";

// ============================================================
// Simple in-memory store using React state
// In production, this would connect to a backend API
// ============================================================

export function useAutoReplyStore() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(DEFAULT_PLATFORMS);
  const [rules, setRules] = useState<KeywordRule[]>(DEFAULT_RULES);
  const [sessions, setSessions] = useState<AutoReplySession[]>(SAMPLE_CONVERSATIONS);
  const [selectedSession, setSelectedSession] = useState<AutoReplySession | null>(SAMPLE_CONVERSATIONS[0] || null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "conversations" | "rules" | "platforms" | "rpa" | "logs">("dashboard");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">("all");
  
  // 日誌系統
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [maxLogs, setMaxLogs] = useState(500);
  
  // 心跳系統
  const [heartbeat, setHeartbeat] = useState<HeartbeatStatus>({
    isAlive: false,
    lastBeat: null,
    intervalMs: 5000,
    beats: 0,
    missedBeats: 0,
  });
  
  // 系統運行時間
  const [startTime] = useState(new Date().toISOString());

  const stats: SystemStats = {
    totalReplied: rules.reduce((sum, r) => sum + r.stats.triggered, 0),
    totalDetected: sessions.reduce((sum, s) => sum + s.messages.filter(m => m.isIncoming).length, 0),
    avgResponseTime: 2.3,
    activeConversations: sessions.filter(s => s.status === "active").length,
    todayReplied: 47,
    successRate: 94.2,
  };

  // Platform actions
  const togglePlatform = useCallback((id: string) => {
    setPlatforms(prev =>
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  }, []);

  const updatePlatform = useCallback((id: string, updates: Partial<PlatformConfig>) => {
    setPlatforms(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, []);

  // Rule actions
  const toggleRule = useCallback((id: string) => {
    setRules(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<KeywordRule>) => {
    setRules(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }, []);

  const addRule = useCallback((rule: KeywordRule) => {
    setRules(prev => [...prev, rule]);
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  // Platform actions
  const addPlatform = useCallback((platform: PlatformConfig) => {
    setPlatforms(prev => [...prev, platform]);
  }, []);

  // Session actions
  const markAsReplied = useCallback((sessionId: string, messageId: string, reply: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          unreadCount: Math.max(0, s.unreadCount - 1),
          messages: s.messages.map(m =>
            m.id === messageId
              ? { ...m, status: "replied" as const, sentReply: reply }
              : m
          ),
        };
      })
    );
  }, []);

  const ignoreMessage = useCallback((sessionId: string, messageId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          unreadCount: Math.max(0, s.unreadCount - 1),
          messages: s.messages.map(m =>
            m.id === messageId ? { ...m, status: "ignored" as const } : m
          ),
        };
      })
    );
  }, []);

  // Send a new message to a session
  const sendMessage = useCallback((sessionId: string, content: string) => {
    const newMessage = {
      id: `m_${Date.now()}`,
      platform: "custom" as Platform,
      platformName: "手動發送",
      sender: "系統",
      content,
      timestamp: new Date().toISOString(),
      status: "replied" as const,
      isIncoming: false,
      sentReply: content,
    };
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          messages: [...s.messages, newMessage],
          lastActivity: newMessage.timestamp,
        };
      })
    );
  }, []);

  // Simulate incoming message detection
  const simulateIncoming = useCallback(() => {
    const platforms = ["shopee", "facebook"] as const;
    const sampleMessages = [
      "請問有優惠嗎？",
      "這個商品多少錢？",
      "有現貨嗎？",
      "運費怎麼算？",
      "你好！",
    ];
    const matchedRules = ["r1", "r2", "r3", "r5"];
    const suggestedReplies = [
      "您好！感謝您的詢問 😊 我們的商品價格請參考商品頁面...",
      "您好！目前商品有現貨，可以直接下單喔！",
      "您好！一般配送時間為 2-5 個工作天...",
      "您好！歡迎光臨 😊 請問有什麼可以幫助您的嗎？",
    ];

    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const ruleIdx = Math.floor(Math.random() * matchedRules.length);

    const newMessage = {
      id: `m_${Date.now()}`,
      platform: randomPlatform,
      platformName: randomPlatform === "shopee" ? "蝦皮購物" : "Facebook Messenger",
      sender: `買家_${Math.floor(Math.random() * 9000 + 1000)}`,
      content: randomMsg,
      timestamp: new Date().toISOString(),
      status: "unread" as const,
      matchedRule: matchedRules[ruleIdx],
      suggestedReply: suggestedReplies[ruleIdx],
      isIncoming: true,
    };

    setSessions(prev => {
      const existingSession = prev.find(s => s.platform === randomPlatform && s.status === "active");
      if (existingSession) {
        return prev.map(s =>
          s.id === existingSession.id
            ? {
                ...s,
                messages: [...s.messages, newMessage],
                unreadCount: s.unreadCount + 1,
                lastActivity: newMessage.timestamp,
              }
            : s
        );
      }
      // Create new session
      const newSession: AutoReplySession = {
        id: `c_${Date.now()}`,
        platform: randomPlatform,
        platformName: newMessage.platformName,
        conversationId: `conv_${Date.now()}`,
        customerName: newMessage.sender,
        messages: [newMessage],
        status: "active",
        lastActivity: newMessage.timestamp,
        unreadCount: 1,
        assignedRules: [matchedRules[ruleIdx]],
      };
      return [newSession, ...prev];
    });

    // Update rule stats
    setRules(prev =>
      prev.map(r =>
        r.id === matchedRules[ruleIdx]
          ? { ...r, stats: { triggered: r.stats.triggered + 1, lastTriggered: new Date().toISOString() } }
          : r
      )
    );
  }, []);

  // ============================================================
  // 日誌功能
  // ============================================================
  
  const addLog = useCallback((level: LogLevel, category: LogCategory, title: string, message: string, platform?: Platform, details?: Record<string, unknown>) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      title,
      message,
      platform,
      details,
    };
    setLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, maxLogs);
    });
  }, [maxLogs]);
  
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  const getLogsByCategory = useCallback((category: LogCategory) => {
    return logs.filter(log => log.category === category);
  }, [logs]);
  
  const getLogsByPlatform = useCallback((platform: Platform) => {
    return logs.filter(log => log.platform === platform);
  }, [logs]);
  
  // ============================================================
  // 心跳功能
  // ============================================================
  
  const startHeartbeat = useCallback((intervalMs: number = 5000) => {
    setHeartbeat(prev => ({
      ...prev,
      isAlive: true,
      intervalMs,
      lastBeat: new Date().toISOString(),
    }));
    addLog("info", "system", "心跳系統啟動", `心跳間隔: ${intervalMs}ms`);
  }, [addLog]);
  
  const stopHeartbeat = useCallback(() => {
    setHeartbeat(prev => ({
      ...prev,
      isAlive: false,
    }));
    addLog("info", "system", "心跳系統停止", "監控已停止");
  }, [addLog]);
  
  const beat = useCallback(() => {
    const now = new Date().toISOString();
    setHeartbeat(prev => {
      // 檢查是否錯過心跳
      let missedBeats = prev.missedBeats;
      if (prev.lastBeat) {
        const lastTime = new Date(prev.lastBeat).getTime();
        const currentTime = Date.now();
        const expectedBeats = Math.floor((currentTime - lastTime) / prev.intervalMs);
        if (expectedBeats > 1) {
          missedBeats += expectedBeats - 1;
        }
      }
      return {
        ...prev,
        lastBeat: now,
        beats: prev.beats + 1,
        missedBeats,
      };
    });
  }, []);
  
  const getSystemStatus = useCallback((): SystemStatus => {
    const uptimeMs = new Date().getTime() - new Date(startTime).getTime();
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    return {
      heartbeat,
      uptime: uptimeSeconds,
      startTime,
      version: "1.0.0",
    };
  }, [heartbeat, startTime]);

  return {
    platforms,
    rules,
    sessions,
    selectedSession,
    setSelectedSession,
    stats,
    isMonitoring,
    activeTab,
    setActiveTab,
    setIsMonitoring,
    selectedPlatform,
    setSelectedPlatform,
    togglePlatform,
    updatePlatform,
    addPlatform,
    toggleRule,
    updateRule,
    addRule,
    deleteRule,
    markAsReplied,
    ignoreMessage,
    sendMessage,
    simulateIncoming,
    // 日誌系統
    logs,
    addLog,
    clearLogs,
    getLogsByCategory,
    getLogsByPlatform,
    // 心跳系統
    heartbeat,
    startHeartbeat,
    stopHeartbeat,
    beat,
    getSystemStatus,
    // 系統時間
    startTime,
  };
}

export type AutoReplyStore = ReturnType<typeof useAutoReplyStore>;
