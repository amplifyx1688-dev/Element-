"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { AutoReplySession, PLATFORM_META } from "@/lib/types";

interface QuickPhrase {
  id: string;
  text: string;
  category: string;
}

const SAMPLE_QUICK_PHRASES: QuickPhrase[] = [
  { id: "1", text: "您好，感謝您的訊息！我們會盡快回覆您。", category: "問候" },
  { id: "2", text: "感謝您的購買，我們已收到您的訂單。", category: "訂單" },
  { id: "3", text: "商品已寄出，預計3-5天送達，請留意包裹。", category: "物流" },
  { id: "4", text: "非常抱歉造成您的不便，我們會立即處理。", category: "抱歉" },
  { id: "5", text: "請問還有其他問題需要協助嗎？", category: "問候" },
  { id: "6", text: "優惠碼已發送給您，請查收！", category: "優惠" },
];

interface ConversationMonitorProps {
  store: AutoReplyStore;
}

export default function ConversationMonitor({ store }: ConversationMonitorProps) {
  const { sessions, rules, markAsReplied, ignoreMessage, simulateIncoming, selectedPlatform, selectedSession, setSelectedSession } = store;
  
  // Filter by selected platform
  const filteredSessions = selectedPlatform === "all"
    ? sessions
    : sessions.filter(s => s.platform === selectedPlatform);
  
  const [editingReply, setEditingReply] = useState<{ msgId: string; text: string } | null>(null);
  const [quickPhrasesCollapsed, setQuickPhrasesCollapsed] = useState(false);
  const [pinnedQuickPhrases, setPinnedQuickPhrases] = useState(false);
  const [quickPhraseSearch, setQuickPhraseSearch] = useState("");

  // Use selectedSession from store
  const currentSession = selectedSession || filteredSessions[0] || null;
  
  const filteredQuickPhrases = SAMPLE_QUICK_PHRASES.filter(p => 
    p.text.toLowerCase().includes(quickPhraseSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(quickPhraseSearch.toLowerCase())
  );

  function getRuleName(ruleId: string) {
    return rules.find(r => r.id === ruleId)?.name || ruleId;
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "今天";
    return d.toLocaleDateString("zh-TW");
  }

  function handleSendReply(sessionId: string, messageId: string, reply: string) {
    markAsReplied(sessionId, messageId, reply);
    setEditingReply(null);
  }

  const totalUnread = sessions.reduce((s, c) => s + c.unreadCount, 0);

  // Get initials for avatar
  function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
  }

  // Generate a consistent color from name
  function getColorFromName(name: string) {
    const colors = [
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
      "from-cyan-500 to-blue-500",
      "from-emerald-500 to-green-500",
      "from-orange-500 to-amber-500",
      "from-indigo-500 to-blue-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="flex h-full animate-fade-in" style={{ height: "calc(100vh - 0px)" }}>
      {/* Center - Conversation Detail */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--bg-primary)" }}>
        {currentSession ? (
          <>
            {/* Conversation Header */}
            <div 
              className="p-4 border-b flex items-center gap-4"
              style={{ 
                borderColor: "var(--border-color)",
                background: "linear-gradient(90deg, rgba(13,17,23,0.98) 0%, rgba(22,27,34,0.95) 100%)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-lg font-semibold shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${PLATFORM_META[currentSession.platform].color}88 0%, ${PLATFORM_META[currentSession.platform].color}44 100%)`,
                  border: `2px solid ${PLATFORM_META[currentSession.platform].color}66`,
                }}
              >
                {PLATFORM_META[currentSession.platform].icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                  {currentSession.customerName}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {PLATFORM_META[currentSession.platform].label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {currentSession.messages.length} 則訊息
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{
                    background: currentSession.status === "active" 
                      ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(63,185,80,0.1) 100%)"
                      : "rgba(139,148,158,0.1)",
                    color: currentSession.status === "active" ? "var(--accent-green)" : "var(--text-secondary)",
                    border: `1px solid ${currentSession.status === "active" ? "rgba(34,197,94,0.3)" : "rgba(139,148,158,0.2)"}`,
                  }}
                >
                  {currentSession.status === "active" ? "● 進行中" : currentSession.status === "waiting" ? "◐ 等待中" : "✓ 已解決"}
                </span>
                <button 
                  onClick={simulateIncoming}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  style={{
                    background: "linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)",
                    boxShadow: "0 2px 8px rgba(31,111,235,0.3)",
                  }}
                >
                  🧪 模擬
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ 
                background: "linear-gradient(180deg, rgba(13,17,23,0.5) 0%, rgba(17,24,39,0.3) 100%)",
              }}
            >
              {currentSession.messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? currentSession.messages[idx - 1] : null;
                const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span
                          className="text-xs px-4 py-1.5 rounded-full inline-block"
                          style={{ 
                            background: "rgba(139,148,158,0.1)", 
                            color: "var(--text-secondary)",
                            border: "1px solid rgba(139,148,158,0.15)",
                          }}
                        >
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    {msg.isIncoming ? (
                      /* Incoming message */
                      <div className="animate-slide-in">
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs flex-shrink-0 shadow-md"
                            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
                          >
                            👤
                          </div>
                          <div className="flex-1 max-w-lg">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                {msg.sender}
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                            <div
                              className="p-4 rounded-2xl rounded-tl-sm text-sm shadow-md"
                              style={{ 
                                background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)", 
                                color: "var(--text-primary)", 
                                border: "1px solid rgba(99,102,241,0.3)",
                              }}
                            >
                              {msg.content}
                            </div>

                            {/* Matched Rule Badge */}
                            {msg.matchedRule && (
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="tag tag-blue">
                                  ⚡ 匹配規則：{getRuleName(msg.matchedRule)}
                                </span>
                                <span
                                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                                  style={{
                                    background: msg.status === "replied" 
                                      ? "rgba(34,197,94,0.15)" 
                                      : msg.status === "ignored" 
                                        ? "rgba(148,163,184,0.1)" 
                                        : "rgba(245,158,11,0.15)",
                                    color: msg.status === "replied" 
                                      ? "var(--accent-green)" 
                                      : msg.status === "ignored" 
                                        ? "var(--text-secondary)" 
                                        : "var(--accent-yellow)",
                                    border: `1px solid ${msg.status === "replied" 
                                      ? "rgba(34,197,94,0.25)" 
                                      : msg.status === "ignored" 
                                        ? "rgba(148,163,184,0.15)" 
                                        : "rgba(245,158,11,0.25)"}`,
                                  }}
                                >
                                  {msg.status === "replied" ? "✓ 已回覆" : msg.status === "ignored" ? "已忽略" : "◐ 待處理"}
                                </span>
                              </div>
                            )}

                            {/* Suggested Reply */}
                            {msg.suggestedReply && msg.status === "unread" && (
                              <div
                                className="mt-3 p-4 rounded-xl shadow-lg"
                                style={{ 
                                  background: "linear-gradient(135deg, rgba(79,142,247,0.1) 0%, rgba(56,139,253,0.05) 100%)", 
                                  border: "1px solid rgba(79,142,247,0.2)" 
                                }}
                              >
                                <div className="font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent-blue)" }}>
                                  <span>💡</span> 建議回覆
                                </div>
                                {editingReply?.msgId === msg.id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      className="input-dark w-full text-sm resize-none"
                                      rows={3}
                                      value={editingReply.text}
                                      onChange={e => setEditingReply({ msgId: msg.id, text: e.target.value })}
                                      style={{
                                        background: "rgba(13,17,23,0.8)",
                                        border: "1px solid rgba(79,142,247,0.3)",
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        className="btn-primary text-xs px-4 py-2"
                                        onClick={() => handleSendReply(currentSession.id, msg.id, editingReply.text)}
                                      >
                                        ✓ 確認發送
                                      </button>
                                      <button
                                        className="btn-secondary text-xs px-4 py-2"
                                        onClick={() => setEditingReply(null)}
                                      >
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mb-3 text-sm" style={{ color: "var(--text-primary)" }}>
                                      {msg.suggestedReply}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                                        onClick={() => handleSendReply(currentSession.id, msg.id, msg.suggestedReply!)}
                                      >
                                        💬 發送
                                      </button>
                                      <button
                                        className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
                                        onClick={() => setEditingReply({ msgId: msg.id, text: msg.suggestedReply! })}
                                      >
                                        📝 編輯
                                      </button>
                                      <button
                                        className="btn-danger text-xs px-4 py-2"
                                        onClick={() => ignoreMessage(currentSession.id, msg.id)}
                                      >
                                        🚧 忽略
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Sent Reply */}
                            {msg.sentReply && (
                              <div
                                className="mt-3 p-3 rounded-lg text-sm"
                                style={{ 
                                  background: "rgba(34,197,94,0.08)", 
                                  border: "1px solid rgba(34,197,94,0.2)" 
                                }}
                              >
                                <span style={{ color: "var(--accent-green)" }}>✓ 已發送：</span>
                                <span style={{ color: "var(--text-secondary)" }}>{msg.sentReply.substring(0, 60)}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Outgoing message */
                      <div className="flex justify-end animate-slide-in">
                        <div className="max-w-lg">
                          <div className="flex items-center justify-end gap-2 mb-1.5">
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {formatTime(msg.timestamp)}
                            </span>
                            <span className="text-xs font-medium" style={{ color: "var(--accent-blue)" }}>
                              自動回覆
                            </span>
                          </div>
                          <div
                            className="p-4 rounded-2xl rounded-tr-sm text-sm shadow-md"
                            style={{ 
                              background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(63,185,80,0.1) 100%)", 
                              color: "var(--text-primary)", 
                              border: "1px solid rgba(34,197,94,0.3)" 
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
            <div className="text-center">
              <div 
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-lg"
                style={{ 
                  background: "linear-gradient(135deg, rgba(31,111,235,0.1) 0%, rgba(56,139,253,0.05) 100%)",
                  border: "1px solid rgba(31,111,235,0.2)",
                }}
              >
                💬
              </div>
              <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>選擇一個對話</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>目前沒有對話</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Phrases Panel - Right Side */}
      <div 
        className="flex flex-col transition-all duration-300 ease-out"
        style={{ 
          borderColor: "var(--border-color)",
          width: quickPhrasesCollapsed ? "56px" : "340px",
          background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.96) 100%)",
        }}
      >
        {/* Panel Header */}
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer"
          style={{ 
            borderColor: "var(--border-color)",
            background: "linear-gradient(90deg, rgba(79,142,247,0.1) 0%, transparent 100%)",
          }}
          onClick={() => setQuickPhrasesCollapsed(!quickPhrasesCollapsed)}
        >
          {!quickPhrasesCollapsed && (
            <>
              <div className="flex items-center gap-2">
                <span 
                  className="text-lg"
                  style={{ 
                    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ⚡
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  快捷語
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setPinnedQuickPhrases(!pinnedQuickPhrases); }}
                  className="p-2 rounded-lg transition-all"
                  style={{ 
                    background: pinnedQuickPhrases ? "rgba(79,142,247,0.2)" : "transparent",
                    color: pinnedQuickPhrases ? "var(--accent-blue)" : "var(--text-secondary)",
                  }}
                  title="釘選面板"
                >
                  📌
                </button>
                <span className="text-lg" style={{ color: "var(--text-secondary)" }}>›</span>
              </div>
            </>
          )}
          {quickPhrasesCollapsed && (
            <div className="w-full flex justify-center">
              <span className="text-lg" style={{ color: "var(--text-secondary)" }}>‹</span>
            </div>
          )}
        </div>

        {/* Panel Content */}
        {!quickPhrasesCollapsed && (
          <>
            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
                <input
                  type="text"
                  placeholder="搜尋快捷語..."
                  value={quickPhraseSearch}
                  onChange={(e) => setQuickPhraseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all"
                  style={{ 
                    background: "rgba(13,17,23,0.6)", 
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Quick Phrases List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredQuickPhrases.map(phrase => (
                <button
                  key={phrase.id}
                  className="w-full p-4 rounded-xl text-left transition-all group"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(79,142,247,0.06) 0%, rgba(79,142,247,0.02) 100%)",
                    border: "1px solid rgba(79,142,247,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(79,142,247,0.08) 100%)";
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.35)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,247,0.06) 0%, rgba(79,142,247,0.02) 100%)";
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.12)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                      style={{ 
                        background: "linear-gradient(135deg, rgba(79,142,247,0.25) 0%, rgba(56,139,253,0.15) 100%)",
                        color: "var(--accent-blue)",
                        border: "1px solid rgba(79,142,247,0.3)",
                      }}
                    >
                      {phrase.category}
                    </span>
                    <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {phrase.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Add New Button */}
            <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  background: "linear-gradient(135deg, rgba(79,142,247,0.2) 0%, rgba(34,197,94,0.15) 100%)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  color: "var(--accent-blue)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.scale = "1";
                }}
              >
                <span className="text-lg">+</span> 新增快捷語
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
