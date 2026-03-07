"use client";

import { useState, useEffect } from "react";
import { AutoReplyStore } from "@/lib/store";
import { PLATFORM_META } from "@/lib/types";

interface DashboardProps {
  store: AutoReplyStore;
}

export default function Dashboard({ store }: DashboardProps) {
  const { stats, sessions, rules, platforms, isMonitoring, simulateIncoming, heartbeat, logs } = store;
  
  // 運行時間狀態
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  const activePlatforms = platforms.filter(p => p.enabled);
  const activeRules = rules.filter(r => r.enabled);
  const recentSessions = [...sessions].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  ).slice(0, 5);

  const topRules = [...rules]
    .sort((a, b) => b.stats.triggered - a.stats.triggered)
    .slice(0, 5);

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
    return d.toLocaleDateString("zh-TW");
  }

  function formatUptime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // 計算運行時間 - 使用 useEffect 定期更新
  useEffect(() => {
    // 每秒更新運行時間
    const interval = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - new Date(store.startTime).getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [store.startTime]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>總覽儀表板</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            跨平台自動化應答系統監控中心
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 心跳狀態 */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: heartbeat.isAlive ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.1)",
              color: heartbeat.isAlive ? "var(--accent-green)" : "var(--text-secondary)",
              border: `1px solid ${heartbeat.isAlive ? "rgba(34, 197, 94, 0.3)" : "rgba(148, 163, 184, 0.2)"}`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: heartbeat.isAlive ? "var(--accent-green)" : "#64748b" }}
            />
            <span className="hidden sm:inline">
              {heartbeat.isAlive ? `❤️ 心跳 ${heartbeat.beats}` : "❤️ 心跳停止"}
            </span>
            <span className="sm:hidden">
              {heartbeat.isAlive ? `❤️ ${heartbeat.beats}` : "❤️ -"}
            </span>
          </div>

          {/* 系統狀態 */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: isMonitoring ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.1)",
              color: isMonitoring ? "var(--accent-green)" : "var(--text-secondary)",
              border: `1px solid ${isMonitoring ? "rgba(34, 197, 94, 0.3)" : "rgba(148, 163, 184, 0.2)"}`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: isMonitoring ? "var(--accent-green)" : "#64748b" }}
            />
            {isMonitoring ? "系統運行中" : "系統已停止"}
          </div>

          {/* 運行時間 */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              color: "var(--accent-blue)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            ⏱️ {formatUptime(uptimeSeconds)}
          </div>

          <button
            onClick={simulateIncoming}
            className="btn-secondary text-sm"
            title="模擬收到新訊息（測試用）"
          >
            🧪 模擬訊息
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💬"
          label="今日已回覆"
          value={stats.todayReplied.toString()}
          sub="+12 較昨日"
          color="var(--accent-green)"
        />
        <StatCard
          icon="🔍"
          label="偵測到訊息"
          value={stats.totalDetected.toString()}
          sub="累計總數"
          color="var(--accent-blue)"
        />
        <StatCard
          icon="⚡"
          label="平均回應時間"
          value={`${stats.avgResponseTime}s`}
          sub="自動回覆延遲"
          color="var(--accent-yellow)"
        />
        <StatCard
          icon="✅"
          label="成功率"
          value={`${stats.successRate}%`}
          sub="關鍵字匹配率"
          color="var(--accent-purple)"
        />
      </div>

      {/* Active Platforms + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Platforms */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              🌐 已啟用平台
            </h2>
            <span className="tag tag-blue">{activePlatforms.length} / {platforms.length}</span>
          </div>
          <div className="space-y-3">
            {platforms.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-lg">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    每 {p.checkInterval}s 檢查
                  </div>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: p.enabled ? "var(--accent-green)" : "#374151" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              💬 最近對話
            </h2>
            <span className="tag tag-yellow">
              {sessions.reduce((s, c) => s + c.unreadCount, 0)} 未讀
            </span>
          </div>
          <div className="space-y-3">
            {recentSessions.map(session => {
              const lastMsg = session.messages[session.messages.length - 1];
              const meta = PLATFORM_META[session.platform];
              return (
                <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg card-hover" style={{ background: "var(--bg-secondary)" }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {session.customerName}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                        {formatTime(session.lastActivity)}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                      {lastMsg?.content || "無訊息"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {session.unreadCount > 0 && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--accent-red)", color: "white", minWidth: "20px", textAlign: "center" }}
                      >
                        {session.unreadCount}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: session.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.1)",
                        color: session.status === "active" ? "var(--accent-green)" : "var(--text-secondary)",
                      }}
                    >
                      {session.status === "active" ? "進行中" : session.status === "waiting" ? "等待中" : "已解決"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Rules + System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rules */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              ⚡ 最常觸發規則
            </h2>
            <span className="tag tag-green">{activeRules.length} 條啟用</span>
          </div>
          <div className="space-y-3">
            {topRules.map((rule, idx) => (
              <div key={rule.id} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: idx === 0 ? "rgba(245,158,11,0.2)" : "rgba(148,163,184,0.1)",
                    color: idx === 0 ? "var(--accent-yellow)" : "var(--text-secondary)",
                  }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {rule.name}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: rule.enabled ? "var(--accent-green)" : "#374151" }}
                    />
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: "var(--border-color)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (rule.stats.triggered / topRules[0].stats.triggered) * 100)}%`,
                        background: "var(--accent-blue)",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--accent-blue)" }}>
                  {rule.stats.triggered}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
            🤖 RPA 系統說明
          </h2>
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">1️⃣</span>
              <p>在「平台設定」中配置目標網頁的 CSS 選擇器，讓系統知道在哪裡找到訊息</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">2️⃣</span>
              <p>在「關鍵字規則」中設定觸發詞和對應的自動回覆內容</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">3️⃣</span>
              <p>在「RPA 自動化」中下載瀏覽器腳本，注入到目標網頁執行自動化</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">4️⃣</span>
              <p>開啟監控開關，系統將自動偵測未讀訊息並根據規則回覆</p>
            </div>
            <div
              className="mt-3 p-3 rounded-lg text-xs"
              style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent-blue)" }}
            >
              💡 支援 Shopee、Lazada、Facebook、LINE 等主流平台，也可自訂任意網頁的選擇器
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div
          className="w-2 h-2 rounded-full mt-1"
          style={{ background: color }}
        />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>
        {label}
      </div>
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {sub}
      </div>
    </div>
  );
}
