"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { PlatformConfig, PLATFORM_META, Platform } from "@/lib/types";

interface PlatformSettingsProps {
  store: AutoReplyStore;
}

const ALL_PLATFORMS: Platform[] = ["shopee", "lazada", "tokopedia", "facebook", "instagram", "line", "whatsapp", "telegram", "custom"];

interface SelectorFieldProps {
  label: string;
  field: keyof NonNullable<PlatformConfig["selectors"]>;
  value: string;
  platformId: string;
  selectors: PlatformConfig["selectors"];
  onUpdate: (id: string, updates: Partial<PlatformConfig>) => void;
}

function SelectorField({ label, field, value, platformId, selectors, onUpdate }: SelectorFieldProps) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      <input
        className="input-dark w-full text-sm font-mono"
        placeholder="CSS 選擇器，例如 .message-list"
        value={value}
        onChange={e => {
          onUpdate(platformId, {
            selectors: { ...selectors, [field]: e.target.value },
          });
        }}
      />
    </div>
  );
}

export default function PlatformSettings({ store }: PlatformSettingsProps) {
  const { platforms, togglePlatform, updatePlatform } = store;
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(platforms[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlatformType, setNewPlatformType] = useState<Platform>("custom");

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  function handleAddPlatform() {
    const meta = PLATFORM_META[newPlatformType];
    const newPlatform: PlatformConfig = {
      id: `p_${Date.now()}`,
      platform: newPlatformType,
      name: meta.label,
      enabled: false,
      url: "",
      selectors: {
        messageList: "",
        messageItem: "",
        inputBox: "",
        sendButton: "",
        unreadBadge: "",
      },
      checkInterval: 10,
      color: meta.color,
      icon: meta.icon,
    };
    store.addPlatform(newPlatform);
    setShowAddModal(false);
  }

  function handleTestSelectors() {
    if (!currentPlatform?.url) {
      alert("請先輸入平台網址");
      return;
    }
    alert(`正在測試 ${currentPlatform.name} 的 CSS 選擇器...\n\n這是模擬功能，實際應用中會：\n1. 打開平台網頁\n2. 驗證選擇器是否有效\n3. 回報測試結果`);
  }

  function handleOpenPlatform() {
    if (currentPlatform?.url) {
      // 使用 window.location.href 導航，避免被瀏覽器屏蔽
      window.location.href = currentPlatform.url;
    } else {
      alert("請先輸入平台網址");
    }
  }

  return (
    <div className="flex h-full animate-fade-in">
      {/* Platform List */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: "var(--border-color)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>平台設定</h2>
            <button
              className="btn-primary text-xs px-3 py-1.5"
              onClick={() => setShowAddModal(true)}
            >
              + 新增
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {platforms.map(p => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className="w-full p-3 rounded-xl text-left transition-all card-hover"
                style={{
                  background: isSelected ? "rgba(79,142,247,0.1)" : "var(--bg-card)",
                  border: `1px solid ${isSelected ? "rgba(79,142,247,0.3)" : "var(--border-color)"}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </span>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 ml-2"
                        style={{ background: p.enabled ? "var(--accent-green)" : "#374151" }}
                      />
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {p.enabled ? `每 ${p.checkInterval}s 檢查` : "已停用"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Platform Overview */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            支援平台
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PLATFORMS.map(p => {
              const meta = PLATFORM_META[p];
              const isConfigured = platforms.some(cp => cp.platform === p);
              return (
                <span
                  key={p}
                  className="text-base"
                  title={`${meta.label}${isConfigured ? " (已設定)" : ""}`}
                  style={{ opacity: isConfigured ? 1 : 0.3 }}
                >
                  {meta.icon}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Editor */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0">
        {currentPlatform ? (
          <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${currentPlatform.color}22`, border: `1px solid ${currentPlatform.color}44` }}
              >
                {currentPlatform.icon}
              </div>
              <div className="flex-1">
                <input
                  className="input-dark text-xl font-bold bg-transparent border-0 border-b px-0 rounded-none w-full"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  value={currentPlatform.name}
                  onChange={e => updatePlatform(currentPlatform.id, { name: e.target.value })}
                />
                <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {PLATFORM_META[currentPlatform.platform].label}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {currentPlatform.enabled ? "啟用中" : "已停用"}
                </span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={currentPlatform.enabled}
                    onChange={() => togglePlatform(currentPlatform.id)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            {/* Basic Config */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>基本設定</h3>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  平台網址
                </label>
                <input
                  className="input-dark w-full text-sm"
                  placeholder="https://..."
                  value={currentPlatform.url || ""}
                  onChange={e => updatePlatform(currentPlatform.id, { url: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  檢查間隔（秒）
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={currentPlatform.checkInterval}
                    className="flex-1"
                    onChange={e => updatePlatform(currentPlatform.id, { checkInterval: Number(e.target.value) })}
                  />
                  <span className="text-sm font-semibold w-12 text-right" style={{ color: "var(--accent-blue)" }}>
                    {currentPlatform.checkInterval}s
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  越短越即時，但會增加系統負擔
                </p>
              </div>
            </div>

            {/* CSS Selectors */}
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    CSS 選擇器設定
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    告訴系統在哪裡找到訊息元素（用於 RPA 自動化）
                  </p>
                </div>
                <a
                  href="#"
                  className="text-xs"
                  style={{ color: "var(--accent-blue)" }}
                  onClick={e => e.preventDefault()}
                >
                  如何找到選擇器？
                </a>
              </div>

              <SelectorField
                label="訊息列表容器"
                field="messageList"
                value={currentPlatform.selectors?.messageList || ""}
                platformId={currentPlatform.id}
                selectors={currentPlatform.selectors}
                onUpdate={updatePlatform}
              />
              <SelectorField
                label="單條訊息元素"
                field="messageItem"
                value={currentPlatform.selectors?.messageItem || ""}
                platformId={currentPlatform.id}
                selectors={currentPlatform.selectors}
                onUpdate={updatePlatform}
              />
              <SelectorField
                label="輸入框"
                field="inputBox"
                value={currentPlatform.selectors?.inputBox || ""}
                platformId={currentPlatform.id}
                selectors={currentPlatform.selectors}
                onUpdate={updatePlatform}
              />
              <SelectorField
                label="發送按鈕"
                field="sendButton"
                value={currentPlatform.selectors?.sendButton || ""}
                platformId={currentPlatform.id}
                selectors={currentPlatform.selectors}
                onUpdate={updatePlatform}
              />
              <SelectorField
                label="未讀數量標記"
                field="unreadBadge"
                value={currentPlatform.selectors?.unreadBadge || ""}
                platformId={currentPlatform.id}
                selectors={currentPlatform.selectors}
                onUpdate={updatePlatform}
              />

              <div
                className="p-3 rounded-lg text-xs"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--text-secondary)" }}
              >
                💡 <strong style={{ color: "var(--accent-yellow)" }}>如何找到 CSS 選擇器：</strong>
                在目標網頁按 F12 開啟開發者工具 → 點擊元素選擇器 → 點擊目標元素 → 右鍵 → Copy → Copy selector
              </div>
            </div>

            {/* Test Connection */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>測試連接</h3>
              <div className="flex gap-3">
                <button className="btn-primary text-sm" onClick={handleTestSelectors}>
                  🔍 測試選擇器
                </button>
                <button className="btn-secondary text-sm" onClick={handleOpenPlatform}>
                  🌐 開啟平台網頁
                </button>
              </div>
              <div
                className="mt-3 p-3 rounded-lg text-xs"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
              >
                測試結果將顯示在這裡...
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">🌐</div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>選擇一個平台進行設定</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Platform Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card p-6 w-96"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>新增平台</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {ALL_PLATFORMS.map(p => {
                const meta = PLATFORM_META[p];
                const isSelected = newPlatformType === p;
                return (
                  <button
                    key={p}
                    onClick={() => setNewPlatformType(p)}
                    className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all"
                    style={{
                      background: isSelected ? `${meta.color}22` : "var(--bg-secondary)",
                      border: `1px solid ${isSelected ? `${meta.color}44` : "var(--border-color)"}`,
                    }}
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="text-xs" style={{ color: isSelected ? meta.color : "var(--text-secondary)" }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={handleAddPlatform}>
                確認新增
              </button>
              <button className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
