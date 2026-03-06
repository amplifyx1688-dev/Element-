"use client";

import { useState, useCallback } from "react";
import {
  KeywordRule,
  PlatformConfig,
  AutoReplySession,
  SystemStats,
  DEFAULT_PLATFORMS,
  DEFAULT_RULES,
  SAMPLE_CONVERSATIONS,
} from "./types";

// ============================================================
// Simple in-memory store using React state
// In production, this would connect to a backend API
// ============================================================

export function useAutoReplyStore() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(DEFAULT_PLATFORMS);
  const [rules, setRules] = useState<KeywordRule[]>(DEFAULT_RULES);
  const [sessions, setSessions] = useState<AutoReplySession[]>(SAMPLE_CONVERSATIONS);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "conversations" | "rules" | "platforms" | "rpa">("dashboard");

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

  return {
    platforms,
    rules,
    sessions,
    stats,
    isMonitoring,
    activeTab,
    setActiveTab,
    setIsMonitoring,
    togglePlatform,
    updatePlatform,
    toggleRule,
    updateRule,
    addRule,
    deleteRule,
    markAsReplied,
    ignoreMessage,
    simulateIncoming,
  };
}

export type AutoReplyStore = ReturnType<typeof useAutoReplyStore>;
