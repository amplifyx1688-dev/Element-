"use client";

import { AutoReplyStore } from "@/lib/store";

interface SidebarProps {
  store: AutoReplyStore;
}

const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "總覽儀表板" },
  { id: "conversations", icon: "💬", label: "對話監控" },
  { id: "rules", icon: "⚡", label: "關鍵字規則" },
  { id: "platforms", icon: "🌐", label: "平台設定" },
  { id: "rpa", icon: "🤖", label: "RPA 自動化" },
] as const;

export default function Sidebar({ store }: SidebarProps) {
  const { activeTab, setActiveTab, isMonitoring, setIsMonitoring, sessions, stats } = store;
  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col sidebar-gradient">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #1f6feb, #bc8cff)" }}>
            🤖
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AutoReply Pro</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>跨平台自動應答</div>
          </div>
        </div>
      </div>

      {/* Monitoring Toggle */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: isMonitoring ? "var(--accent-green)" : "#64748b" }}
            />
            <span className="text-sm font-medium" style={{ color: isMonitoring ? "var(--accent-green)" : "var(--text-secondary)" }}>
              {isMonitoring ? "監控中" : "已停止"}
            </span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={isMonitoring}
              onChange={() => setIsMonitoring(!isMonitoring)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "nav-active" : ""}`}
            style={{
              color: activeTab === item.id ? "var(--accent-blue)" : "var(--text-secondary)",
              border: activeTab === item.id ? undefined : "1px solid transparent",
            }}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "conversations" && totalUnread > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--accent-red)", color: "white", minWidth: "20px", textAlign: "center" }}
              >
                {totalUnread}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
        <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          今日統計
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>已回覆</span>
            <span className="font-semibold" style={{ color: "var(--accent-green)" }}>{stats.todayReplied}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>成功率</span>
            <span className="font-semibold" style={{ color: "var(--accent-blue)" }}>{stats.successRate}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>平均回應</span>
            <span className="font-semibold" style={{ color: "var(--accent-yellow)" }}>{stats.avgResponseTime}s</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
