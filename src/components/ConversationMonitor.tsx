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

  return (
    <div className="flex h-full animate-fade-in" style={{ height: "calc(100vh - 0px)" }}>
      {/* Left Side - Conversation Detail */}
      <div className="flex-1 flex min-w-0">
        {/* Conversation Detail */}
        <div className="flex-1 flex flex-col min-w-0">
        {currentSession ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border-color)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base"
                style={{
                  background: `${PLATFORM_META[currentSession.platform].color}22`,
                  border: `1px solid ${PLATFORM_META[currentSession.platform].color}44`,
                }}
              >
                {PLATFORM_META[currentSession.platform].icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {currentSession.customerName}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {PLATFORM_META[currentSession.platform].label} · {currentSession.messages.length} 則訊息
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: currentSession.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.1)",
                    color: currentSession.status === "active" ? "var(--accent-green)" : "var(--text-secondary)",
                    border: `1px solid ${currentSession.status === "active" ? "rgba(34,197,94,0.3)" : "rgba(148,163,184,0.2)"}`,
                  }}
                >
                  {currentSession.status === "active" ? "進行中" : currentSession.status === "waiting" ? "等待中" : "已解決"}
                </span>
                <button onClick={simulateIncoming} className="btn-secondary text-xs px-2 py-1">
                  🧪 模擬
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              {currentSession.messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? currentSession.messages[idx - 1] : null;
                const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-2">
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                        >
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    {msg.isIncoming ? (
                      /* Incoming message */
                      <div className="animate-slide-in">
                        <div className="flex items-start gap-2 mb-1">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                          >
                            👤
                          </div>
                          <div className="flex-1 max-w-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                {msg.sender}
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                            <div
                              className="p-3 rounded-2xl rounded-tl-sm text-sm"
                              style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                            >
                              {msg.content}
                            </div>

                            {/* Matched Rule Badge */}
                            {msg.matchedRule && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="tag tag-blue text-xs">
                                  ⚡ 匹配規則：{getRuleName(msg.matchedRule)}
                                </span>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    background: msg.status === "replied" ? "rgba(34,197,94,0.15)" : msg.status === "ignored" ? "rgba(148,163,184,0.1)" : "rgba(245,158,11,0.15)",
                                    color: msg.status === "replied" ? "var(--accent-green)" : msg.status === "ignored" ? "var(--text-secondary)" : "var(--accent-yellow)",
                                  }}
                                >
                                  {msg.status === "replied" ? "✓ 已回覆" : msg.status === "ignored" ? "已忽略" : "待處理"}
                                </span>
                              </div>
                            )}

                            {/* Suggested Reply */}
                            {msg.suggestedReply && msg.status === "unread" && (
                              <div
                                className="mt-2 p-3 rounded-xl text-xs"
                                style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)" }}
                              >
                                <div className="font-semibold mb-1.5" style={{ color: "var(--accent-blue)" }}>
                                  💡 建議回覆
                                </div>
                                {editingReply?.msgId === msg.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      className="input-dark w-full text-xs resize-none"
                                      rows={3}
                                      value={editingReply.text}
                                      onChange={e => setEditingReply({ msgId: msg.id, text: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        className="btn-primary text-xs px-3 py-1.5"
                                        onClick={() => handleSendReply(currentSession.id, msg.id, editingReply.text)}
                                      >
                                        ✓ 確認發送
                                      </button>
                                      <button
                                        className="btn-secondary text-xs px-3 py-1.5"
                                        onClick={() => setEditingReply(null)}
                                      >
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mb-2" style={{ color: "var(--text-primary)" }}>
                                      {msg.suggestedReply}
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        className="btn-primary text-xs px-3 py-1.5"
                                        onClick={() => handleSendReply(currentSession.id, msg.id, msg.suggestedReply!)}
                                      >
                                        ✓ 直接發送
                                      </button>
                                      <button
                                        className="btn-secondary text-xs px-3 py-1.5"
                                        onClick={() => setEditingReply({ msgId: msg.id, text: msg.suggestedReply! })}
                                      >
                                        ✏️ 編輯後發送
                                      </button>
                                      <button
                                        className="btn-danger text-xs px-3 py-1.5"
                                        onClick={() => ignoreMessage(currentSession.id, msg.id)}
                                      >
                                        忽略
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Sent Reply */}
                            {msg.sentReply && (
                              <div
                                className="mt-2 p-2 rounded-lg text-xs"
                                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
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
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {formatTime(msg.timestamp)}
                            </span>
                            <span className="text-xs font-medium" style={{ color: "var(--accent-blue)" }}>
                              自動回覆
                            </span>
                          </div>
                          <div
                            className="p-3 rounded-2xl rounded-tr-sm text-sm"
                            style={{ background: "rgba(79,142,247,0.15)", color: "var(--text-primary)", border: "1px solid rgba(79,142,247,0.3)" }}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>選擇一個對話查看詳情</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Quick Phrases Panel - Right Side */}
      <div 
        className="flex flex-col border-l transition-all duration-300 ease-out"
        style={{ 
          borderColor: "var(--border-color)",
          width: quickPhrasesCollapsed ? "48px" : "320px",
          background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.95) 100%)",
        }}
      >
        {/* Panel Header */}
        <div 
          className="p-3 border-b flex items-center justify-between cursor-pointer"
          style={{ 
            borderColor: "var(--border-color)",
            background: "linear-gradient(90deg, rgba(79,142,247,0.08) 0%, transparent 100%)",
          }}
          onClick={() => setQuickPhrasesCollapsed(!quickPhrasesCollapsed)}
        >
          {!quickPhrasesCollapsed && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>⚡ 快捷語</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setPinnedQuickPhrases(!pinnedQuickPhrases); }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ 
                    background: pinnedQuickPhrases ? "rgba(79,142,247,0.2)" : "transparent",
                    color: pinnedQuickPhrases ? "var(--accent-blue)" : "var(--text-secondary)",
                  }}
                  title="釘選面板"
                >
                  📌
                </button>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>‹</span>
              </div>
            </>
          )}
          {quickPhrasesCollapsed && (
            <span className="text-lg" style={{ color: "var(--text-secondary)" }}>›</span>
          )}
        </div>

        {/* Panel Content */}
        {!quickPhrasesCollapsed && (
          <>
            {/* Search */}
            <div className="p-3 border-b" style={{ borderColor: "var(--border-color)" }}>
              <input
                type="text"
                placeholder="搜尋快捷語..."
                value={quickPhraseSearch}
                onChange={(e) => setQuickPhraseSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                style={{ 
                  background: "var(--bg-secondary)", 
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Quick Phrases List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredQuickPhrases.map(phrase => (
                <button
                  key={phrase.id}
                  className="w-full p-3 rounded-xl text-left transition-all group"
                  style={{ 
                    background: "rgba(79,142,247,0.05)",
                    border: "1px solid rgba(79,142,247,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(79,142,247,0.12)";
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(79,142,247,0.05)";
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.15)";
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        background: "rgba(79,142,247,0.2)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      {phrase.category}
                    </span>
                    <span 
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      點擊使用
                    </span>
                  </div>
                  <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {phrase.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Add New Button */}
            <div className="p-3 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  background: "linear-gradient(135deg, rgba(79,142,247,0.2) 0%, rgba(34,197,94,0.15) 100%)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  color: "var(--accent-blue)",
                }}
              >
                <span>+</span> 新增快捷語
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
