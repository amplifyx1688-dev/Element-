"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { AutoReplySession, PLATFORM_META } from "@/lib/types";

interface ConversationMonitorProps {
  store: AutoReplyStore;
}

export default function ConversationMonitor({ store }: ConversationMonitorProps) {
  const { sessions, rules, markAsReplied, ignoreMessage, simulateIncoming, selectedPlatform } = store;
  
  // Filter by selected platform
  const filteredSessions = selectedPlatform === "all"
    ? sessions
    : sessions.filter(s => s.platform === selectedPlatform);
  
  const [selectedSession, setSelectedSession] = useState<string | null>(
    filteredSessions.find(s => s.unreadCount > 0)?.id || filteredSessions[0]?.id || null
  );
  const [editingReply, setEditingReply] = useState<{ msgId: string; text: string } | null>(null);

  const currentSession = filteredSessions.find(s => s.id === selectedSession);

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
      {/* Session List */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r" style={{ borderColor: "var(--border-color)" }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              對話監控
              {totalUnread > 0 && (
                <span
                  className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent-red)", color: "white" }}
                >
                  {totalUnread}
                </span>
              )}
            </h2>
            <button onClick={simulateIncoming} className="btn-secondary text-xs px-2 py-1">
              🧪 模擬
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              暫無對話
            </div>
          ) : (
            filteredSessions.map(session => {
              const meta = PLATFORM_META[session.platform];
              const lastMsg = session.messages[session.messages.length - 1];
              const isSelected = selectedSession === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className="w-full p-4 text-left border-b transition-all"
                  style={{
                    borderColor: "var(--border-color)",
                    background: isSelected ? "rgba(79,142,247,0.08)" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--accent-blue)" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {session.customerName}
                        </span>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--text-secondary)" }}>
                          {formatTime(session.lastActivity)}
                        </span>
                      </div>
                      <p className="text-xs truncate mb-1" style={{ color: "var(--text-secondary)" }}>
                        {lastMsg?.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: meta.color }}>{meta.label}</span>
                        {session.unreadCount > 0 && (
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "var(--accent-red)", color: "white" }}
                          >
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

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
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
  );
}
