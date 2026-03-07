"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { PLATFORM_META, Platform } from "@/lib/types";

interface SidebarProps {
  store: AutoReplyStore;
}

const APP_NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "總覽儀表板" },
  { id: "conversations", icon: "💬", label: "對話監控" },
  { id: "rules", icon: "⚡", label: "關鍵字規則" },
  { id: "platforms", icon: "🌐", label: "平台設定" },
  { id: "rpa", icon: "🤖", label: "RPA 自動化" },
  { id: "logs", icon: "📋", label: "系統日誌" },
] as const;

export default function Sidebar({ store }: SidebarProps) {
  const { 
    activeTab, 
    setActiveTab, 
    isMonitoring, 
    setIsMonitoring, 
    sessions, 
    stats,
    selectedPlatform,
    setSelectedPlatform,
    platforms,
  } = store;
  
  const [collapsed, setCollapsed] = useState(false);

  // Get enabled platforms only
  const enabledPlatforms = platforms.filter(p => p.enabled);
  
  // Data flow:
  // 1. RPA scripts monitor target platforms (Shopee, Lazada, FB, LINE, etc.)
  // 2. Extract conversation data from DOM (customer name, last message, unread count)
  // 3. Call setSessions() to update the store with new conversation data
  // 4. Sidebar automatically filters and displays conversations by selectedPlatform
  //
  // For now, using SAMPLE_CONVERSATIONS as demo data.
  // Real implementation would connect to RPA automation or API.

  // Filter sessions by selected platform
  const filteredSessions = selectedPlatform === "all" 
    ? sessions 
    : sessions.filter(s => s.platform === selectedPlatform);
  
  const totalUnread = filteredSessions.reduce((sum, s) => sum + s.unreadCount, 0);

  // Format time
  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <aside
      className="flex-shrink-0 flex flex-col sidebar-gradient"
      style={{
        width: collapsed ? "64px" : "280px",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo + Toggle */}
      <div
        className="flex items-center border-b"
        style={{
          borderColor: "var(--border-color)",
          padding: collapsed ? "12px 0" : "12px 16px",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: "56px",
          transition: "padding 0.3s ease",
        }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1f6feb, #bc8cff)" }}
            >
              🤖
            </div>
            <div style={{ whiteSpace: "nowrap" }}>
              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AutoReply Pro</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1f6feb, #bc8cff)" }}
          >
            🤖
          </div>
        )}

        {/* Toggle button */}
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
              fontSize: "10px",
              lineHeight: 1,
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            ◀
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {collapsed && (
        <div className="flex justify-center" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
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
              fontSize: "10px",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
          >
            ▶
          </button>
        </div>
      )}

      {/* Platform Tabs - 平台切換 */}
      {!collapsed && (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)" }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            選擇平台
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {/* All platforms option */}
            <button
              onClick={() => setSelectedPlatform("all")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 500,
                border: selectedPlatform === "all" ? "1px solid var(--accent-blue)" : "1px solid var(--border-color)",
                background: selectedPlatform === "all" ? "rgba(88, 166, 255, 0.12)" : "transparent",
                color: selectedPlatform === "all" ? "var(--accent-blue)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🌐 全部
            </button>
            
            {/* Each enabled platform */}
            {enabledPlatforms.map(platform => {
              const meta = PLATFORM_META[platform.platform];
              const platformSessions = sessions.filter(s => s.platform === platform.platform);
              const platformUnread = platformSessions.reduce((sum, s) => sum + s.unreadCount, 0);
              const isSelected = selectedPlatform === platform.platform;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.platform)}
                  title={`${meta.label} - ${platformUnread} 未讀`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 500,
                    border: isSelected ? `1px solid ${meta.color}` : "1px solid var(--border-color)",
                    background: isSelected ? `${meta.color}22` : "transparent",
                    color: isSelected ? meta.color : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {platformUnread > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "var(--accent-red)",
                        color: "white",
                        fontSize: "9px",
                        fontWeight: "bold",
                        padding: "1px 4px",
                        borderRadius: "8px",
                        minWidth: "14px",
                        textAlign: "center",
                      }}
                    >
                      {platformUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsed: show platform icons only */}
      {collapsed && (
        <div style={{ padding: "8px 4px", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
            <button
              onClick={() => setSelectedPlatform("all")}
              title="全部平台"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                border: selectedPlatform === "all" ? "1px solid var(--accent-blue)" : "1px solid transparent",
                background: selectedPlatform === "all" ? "rgba(88, 166, 255, 0.15)" : "transparent",
                cursor: "pointer",
              }}
            >
              🌐
            </button>
            {enabledPlatforms.map(platform => {
              const meta = PLATFORM_META[platform.platform];
              const isSelected = selectedPlatform === platform.platform;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.platform)}
                  title={meta.label}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    border: isSelected ? `1px solid ${meta.color}` : "1px solid transparent",
                    background: isSelected ? `${meta.color}22` : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {meta.icon}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation List - 對話列表 */}
      <div className="flex-1 overflow-y-auto" style={{ borderBottom: "1px solid var(--border-color)" }}>
        {/* Data source indicator - 數據來源指示器 */}
        {!collapsed && (
          <div 
            className="flex items-center gap-2 px-3 py-2 text-xs"
            style={{ 
              borderBottom: "1px solid var(--border-color)",
              background: isMonitoring ? "rgba(34, 197, 94, 0.08)" : "rgba(107, 114, 128, 0.08)"
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: isMonitoring ? "#22c55e" : "#6b7280" }}
            />
            <span style={{ color: isMonitoring ? "#22c55e" : "var(--text-secondary)" }}>
              {isMonitoring ? "即時監控中" : "離線模式"}
            </span>
            <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
              {filteredSessions.length} 對話
            </span>
          </div>
        )}

        {/* Conversation Items - 對話列表 */}
        {!collapsed && filteredSessions.length > 0 && (
          <div style={{ padding: "4px 8px" }}>
            {filteredSessions.map((session) => {
              const meta = PLATFORM_META[session.platform];
              const isActive = store.selectedSession?.id === session.id;
              
              return (
                <button
                  key={session.id}
                  onClick={() => store.setSelectedSession(session)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    marginBottom: "2px",
                    borderRadius: "6px",
                    border: isActive ? "1px solid var(--accent-blue)" : "1px solid transparent",
                    background: isActive ? "rgba(88, 166, 255, 0.1)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: `${meta.color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span 
                        style={{ 
                          fontSize: "12px", 
                          fontWeight: 600, 
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {session.customerName}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>
                        {formatTime(session.lastActivity)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                      <span 
                        style={{ 
                          fontSize: "11px", 
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "140px",
                        }}
                      >
                        {session.messages[session.messages.length - 1]?.content || "尚無訊息"}
                      </span>
                      {session.unreadCount > 0 && (
                        <span
                          style={{
                            background: "var(--accent-red)",
                            color: "white",
                            fontSize: "9px",
                            fontWeight: "bold",
                            padding: "1px 5px",
                            borderRadius: "8px",
                            minWidth: "16px",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {session.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!collapsed && filteredSessions.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              暫無對話
            </span>
          </div>
        )}

        {/* Collapsed: show session count */}
        {collapsed && (
          <div style={{ padding: "8px 0", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              {filteredSessions.length}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
              對話
            </div>
          </div>
        )}
      </div>

      {/* Monitoring Status */}
      <div style={{ padding: collapsed ? "8px 4px" : "10px 12px", borderBottom: "1px solid var(--border-color)" }}>
        <div 
          className="card"
          style={{
            padding: collapsed ? "6px 0" : "8px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: "8px",
          }}
        >
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
              <span style={{ fontSize: "11px", fontWeight: 500, color: isMonitoring ? "var(--accent-green)" : "var(--text-secondary)" }}>
                {isMonitoring ? "監控中" : "已停止"}
              </span>
            )}
          </div>

          {!collapsed && (
            <label className="toggle" style={{ flexShrink: 0, transform: "scale(0.7)" }}>
              <input
                type="checkbox"
                checked={isMonitoring}
                onChange={() => setIsMonitoring(!isMonitoring)}
              />
              <span className="toggle-slider" />
            </label>
          )}
        </div>
      </div>

      {/* App Navigation - 應用導航 (bottom) */}
      <div style={{ padding: collapsed ? "8px 4px" : "8px 12px" }}>
        {!collapsed && (
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: "var(--text-muted)" }}>
            應用
          </div>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {APP_NAV_ITEMS.map(item => {
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
                  gap: collapsed ? 0 : "8px",
                  padding: collapsed ? "8px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "6px",
                  border: isActive ? undefined : "1px solid transparent",
                  background: isActive ? undefined : "transparent",
                  color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: collapsed ? "14px" : "12px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats - 統計 (only when expanded) */}
      {!collapsed && (
        <div className="p-3 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)" }}>今日回覆</span>
              <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>{stats.todayReplied}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)" }}>成功率</span>
              <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>{stats.successRate}%</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
