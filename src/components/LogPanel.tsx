"use client";

import { useState, useMemo } from "react";
import { LogEntry, LogLevel, LogCategory, PLATFORM_META, Platform } from "../lib/types";

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  info: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
};

const LOG_CATEGORY_LABELS: Record<LogCategory, string> = {
  system: "系統",
  message: "訊息",
  reply: "回覆",
  rule: "規則",
  platform: "平台",
  rpa: "RPA",
  error: "錯誤",
};

export default function LogPanel({ logs, onClear }: LogPanelProps) {
  const [filterCategory, setFilterCategory] = useState<LogCategory | "all">("all");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterCategory !== "all" && log.category !== filterCategory) return false;
      if (filterPlatform !== "all" && log.platform !== filterPlatform) return false;
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !log.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [logs, filterCategory, filterPlatform, searchTerm]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-TW", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: false 
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  const getCategoryIcon = (category: LogCategory) => {
    const icons: Record<LogCategory, string> = {
      system: "⚙️",
      message: "💬",
      reply: "📤",
      rule: "📋",
      platform: "🌐",
      rpa: "🤖",
      error: "❌",
    };
    return icons[category];
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] rounded-lg border border-[#2a2a4a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <h2 className="text-lg font-semibold text-white">系統日誌</h2>
          <span className="px-2 py-0.5 text-xs bg-[#2a2a4a] text-gray-400 rounded-full">
            {filteredLogs.length} 筆
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 rounded bg-[#2a2a4a] border-[#3a3a5a]"
            />
            自動滾動
          </label>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm bg-[#2a2a4a] hover:bg-[#3a3a5a] text-gray-300 rounded-lg transition-colors"
          >
            清除日誌
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-3 border-b border-[#2a2a4a] bg-[#16162a]">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋日誌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4a4a6a]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as LogCategory | "all")}
          className="px-3 py-2 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg text-sm text-white focus:outline-none focus:border-[#4a4a6a]"
        >
          <option value="all">所有類別</option>
          {Object.entries(LOG_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | "all")}
          className="px-3 py-2 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg text-sm text-white focus:outline-none focus:border-[#4a4a6a]"
        >
          <option value="all">所有平台</option>
          {Object.entries(PLATFORM_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.icon} {meta.label}</option>
          ))}
        </select>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-4xl mb-2">📭</span>
            <p>暫無日誌記錄</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a2e] hover:bg-[#202040] transition-colors"
            >
              {/* Time */}
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                <span className="text-[10px] text-gray-600">{formatTimeAgo(log.timestamp)}</span>
              </div>

              {/* Icon & Category */}
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="text-lg">{getCategoryIcon(log.category)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: LOG_LEVEL_COLORS[log.level] }}
                  >
                    {log.title}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-[#2a2a4a] text-gray-400 rounded">
                    {LOG_CATEGORY_LABELS[log.category]}
                  </span>
                  {log.platform && (
                    <span className="text-xs text-gray-500">
                      {PLATFORM_META[log.platform]?.icon} {PLATFORM_META[log.platform]?.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-0.5 truncate">{log.message}</p>
                {log.details && (
                  <pre className="mt-1 p-2 bg-[#0a0a15] rounded text-xs text-gray-500 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
