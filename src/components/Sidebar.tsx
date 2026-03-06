"use client";

import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0);

  return (
    <aside
      className="flex-shrink-0 flex flex-col sidebar-gradient"
      style={{
        width: collapsed ? "64px" : "256px",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo + Toggle Button */}
      <div
        className="flex items-center border-b"
        style={{
          borderColor: "var(--border-color)",
          padding: collapsed ? "16px 0" : "16px 20px",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: "64px",
          transition: "padding 0.3s ease",
        }}
      >
        {/* Logo area */}
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1f6feb, #bc8cff)" }}
            >
              🤖
            </div>
            <div style={{ whiteSpace: "nowrap" }}>
              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AutoReply Pro</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>跨平台自動應答</div>
            </div>
          </div>
        )}

        {/* Collapsed: show logo icon only */}
        {collapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1f6feb, #bc8cff)" }}
          >
            🤖
          </div>
        )}

        {/* Toggle button — only visible when expanded */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="收起側邊欄"
            style={{
              background: "rgba(139, 148, 158, 0.08)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px 6px",
              fontSize: "12px",
              lineHeight: 1,
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            ◀
          </button>
        )}
      </div>

      {/* Expand toggle — shown when collapsed, centered */}
      {collapsed && (
        <div
          className="flex justify-center"
          style={{ padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}
        >
          <button
            onClick={() => setCollapsed(false)}
            title="展開側邊欄"
            style={{
              background: "rgba(139, 148, 158, 0.08)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px 6px",
              fontSize: "12px",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
          >
            ▶
          </button>
        </div>
      )}

      {/* App-Switching Navigation (top section) */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: collapsed ? "8px 0" : "8px 12px" }}>
        {/* Section label */}
        {!collapsed && (
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
            style={{ color: "var(--text-muted)" }}
          >
            應用切換
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={isActive ? "nav-active" : ""}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : "10px",
                  padding: collapsed ? "10px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  border: isActive ? undefined : "1px solid transparent",
                  background: isActive ? undefined : "transparent",
                  color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>

                {!collapsed && (
                  <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label}
                  </span>
                )}

                {/* Unread badge for conversations */}
                {item.id === "conversations" && totalUnread > 0 && (
                  <span
                    style={{
                      background: "var(--accent-red)",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "1px 5px",
                      borderRadius: "10px",
                      minWidth: "18px",
                      textAlign: "center",
                      position: collapsed ? "absolute" : "static",
                      top: collapsed ? "4px" : undefined,
                      right: collapsed ? "4px" : undefined,
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monitoring Toggle */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          {!collapsed && (
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: "var(--text-muted)" }}
            >
              監控狀態
            </div>
          )}

          <div
            className="card"
            style={{
              padding: collapsed ? "8px 0" : "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              gap: "8px",
              margin: collapsed ? "0 8px" : "0",
            }}
          >
            {/* Status dot + label */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                className="animate-pulse-dot"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isMonitoring ? "var(--accent-green)" : "#64748b",
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: isMonitoring ? "var(--accent-green)" : "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isMonitoring ? "監控中" : "已停止"}
                </span>
              )}
            </div>

            {/* Toggle switch — only in expanded mode */}
            {!collapsed && (
              <label className="toggle" style={{ flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={isMonitoring}
                  onChange={() => setIsMonitoring(!isMonitoring)}
                />
                <span className="toggle-slider" />
              </label>
            )}
          </div>

          {/* Collapsed: tap dot to toggle */}
          {collapsed && (
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              title={isMonitoring ? "停止監控" : "開始監控"}
              style={{
                display: "block",
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textAlign: "center",
                fontSize: "10px",
                color: isMonitoring ? "var(--accent-green)" : "var(--text-secondary)",
              }}
            >
              {isMonitoring ? "ON" : "OFF"}
            </button>
          )}
        </div>
      </nav>

      {/* Quick Stats — only in expanded mode */}
      {!collapsed && (
        <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div
            className="text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            今日統計
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)" }}>已回覆</span>
              <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>{stats.todayReplied}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)" }}>成功率</span>
              <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>{stats.successRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)" }}>平均回應</span>
              <span style={{ fontWeight: 600, color: "var(--accent-yellow)" }}>{stats.avgResponseTime}s</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
