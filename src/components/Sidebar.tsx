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
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              對話列表 {selectedPlatform !== "all" && `(${PLATFORM_META[selectedPlatform as Platform]?.label || ""})`}
            </div>
          </div>
        )}

        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>💭</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {selectedPlatform === "all" ? "暫無對話" : "此平台暫無對話"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredSessions.slice(0, collapsed ? 5 : 20).map(session => {
              const meta = PLATFORM_META[session.platform];
              const lastMsg = session.messages[session.messages.length - 1];
              const isUnread = session.unreadCount > 0;
              
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    setActiveTab("conversations");
                    // TODO: Could also set selected conversation in ConversationMonitor
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : "8px",
                    padding: collapsed ? "8px 0" : "8px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border-color)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: collapsed ? "28px" : "36px",
                      height: collapsed ? "28px" : "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: collapsed ? "12px" : "14px",
                      background: `${meta.color}22`,
                      border: `1px solid ${meta.color}44`,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>

                  {/* Info - hidden when collapsed */}
                  {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <span 
                          style={{ 
                            fontSize: "12px", 
                            fontWeight: isUnread ? 600 : 400, 
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {session.customerName}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0, marginLeft: "4px" }}>
                          {formatTime(session.lastActivity)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                          {lastMsg?.content}
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
                              flexShrink: 0,
                            }}
                          >
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Show count if more */}
            {filteredSessions.length > (collapsed ? 5 : 20) && (
              <div className="p-2 text-center">
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  +{filteredSessions.length - (collapsed ? 5 : 20)} 更多對話
                </span>
              </div>
            )}
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
