"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { PlatformConfig, PLATFORM_META, Platform } from "@/lib/types";

interface PlatformSettingsProps {
  store: AutoReplyStore;
}

const ALL_PLATFORMS: Platform[] = ["shopee", "lazada", "tokopedia", "facebook", "instagram", "line", "whatsapp", "telegram", "custom"];

// Facebook scraper script content
const SCRAPER_SCRIPT_CONTENT = `
// AutoReply Pro - Facebook Messenger Scraper
(function() {
  console.log("🔄 開始擷取 Facebook Messenger 對話...");
  
  const conversations = [];
  const maxConversations = 10;
  
  const conversationSelectors = [
    "[role=\"presentation\"] > [role=\"listbox\"] > [role=\"option\"]",
    "[aria-label*=\"訊息\"][role=\"listbox\"] [role=\"option\"]",
    ".x1n2onr6.xh8yej3",
    "div[aria-label*=\"Conversations\"] div[role=\"option\"]"
  ];
  
  let conversationItems = [];
  for (const selector of conversationSelectors) {
    conversationItems = document.querySelectorAll(selector);
    if (conversationItems.length > 0) break;
  }
  
  console.log("📋 找到 " + conversationItems.length + " 個對話項目");
  
  const itemsToProcess = Math.min(conversationItems.length, maxConversations);
  
  for (let i = 0; i < itemsToProcess; i++) {
    const item = conversationItems[i];
    try {
      const nameEl = item.querySelector("[aria-label], span[class*=\"name\"], div[class*=\"title\"]");
      let customerName = nameEl ? nameEl.textContent?.trim() : "未知用戶";
      customerName = customerName.replace(/\\d{1,2}:\\d{2}/g, '').trim();
      if (!customerName) customerName = "用戶_" + (i + 1);
      
      const messageEl = item.querySelector("span[class*=\"preview\"], span[class*=\"message\"], div[class*=\"snippet\"]");
      const lastMessage = messageEl ? messageEl.textContent?.trim() : "";
      
      const timeEl = item.querySelector("span[class*=\"time\"], span[class*=\"timestamp\"], abbr");
      const timestamp = timeEl ? timeEl.getAttribute("title") || timeEl.textContent : new Date().toISOString();
      
      const unreadEl = item.querySelector("[class*=\"unread\"], [aria-label*=\"未讀\"]");
      const unreadCount = unreadEl ? 1 : 0;
      
      conversations.push({
        id: "fb_conv_" + Date.now() + "_" + i,
        customerName: customerName,
        lastMessage: lastMessage || "(無訊息)",
        timestamp: timestamp,
        unreadCount: unreadCount,
        platform: "facebook"
      });
    } catch (e) {
      console.warn("⚠️ 處理對話 " + i + " 時出錯:", e);
    }
  }
  
  if (conversations.length === 0) {
    console.log("❌ 無法找到對話，請確保您已打開 Facebook Messenger 對話列表");
    alert("無法找到對話！請確保：\\n1. 您已登入 Facebook Messenger\\n2. 正在對話列表頁面\\n3. 嘗試重新整理頁面");
    return;
  }
  
  console.log("✅ 成功擷取 " + conversations.length + " 個對話");
  
  fetch(window.location.origin + "/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "import",
      platform: "facebook",
      conversations: conversations
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("📤 已發送到 AutoReply Pro:", data);
    alert("✅ 成功匯入 " + conversations.length + " 個對話至 AutoReply Pro！\\n\\n請返回 AutoReply Pro 查看對話列表。");
  })
  .catch(err => {
    console.error("❌ 發送失敗:", err);
    alert("❌ 發送失敗！請確保 AutoReply Pro 正在運行。\\n錯誤: " + err.message);
  });
})();
`;

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

  const [testResult, setTestResult] = useState<string>("測試結果將顯示在這裡...");

  function handleTestSelectors() {
    if (!currentPlatform?.url) {
      setTestResult("請先輸入平台網址");
      return;
    }
    
    const selectors = currentPlatform.selectors;
    const filledSelectors = Object.entries(selectors || {}).filter(([, v]) => v && v.trim() !== "");
    
    if (filledSelectors.length === 0) {
      setTestResult("❌ 測試失敗：尚未設定任何 CSS 選擇器，請先填寫選擇器後再測試");
      return;
    }
    
    const selectorList = filledSelectors.map(([key, value]) => `  • ${key}: ${value}`).join("\n");
    
    setTestResult(`正在連接 ${currentPlatform.name}...\n\n已配置選擇器：\n${selectorList}\n\n網址：${currentPlatform.url}`);
    
    navigator.clipboard.writeText(currentPlatform.url).then(() => {
      setTestResult(prev => prev + "\n\n✅ 網址已複製到剪貼簿，請在瀏覽器新分頁貼上並打開驗證");
    }).catch(() => {
      setTestResult(prev => prev + "\n\n⚠️ 無法複製網址，請手動複製以下網址：\n" + currentPlatform.url);
    });
  }

  function handleOpenPlatform() {
    if (currentPlatform?.url) {
      navigator.clipboard.writeText(currentPlatform.url).then(() => {
        setTestResult("✅ 網址已複製到剪貼簿，請自行在瀏覽器貼上並開啟：\n\n" + currentPlatform.url);
      }).catch(() => {
        setTestResult("⚠️ 無法複製網址，請手動複製：\n" + currentPlatform.url);
      });
    } else {
      setTestResult("請先輸入平台網址");
    }
  }

  // Scraper modal state
  const [showScraperModal, setShowScraperModal] = useState(false);
  
  function handleFetchConversations() {
    if (!currentPlatform || currentPlatform.platform !== "facebook") {
      setTestResult("目前僅支援 Facebook Messenger 的自動擷取功能");
      return;
    }
    setShowScraperModal(true);
  }
  
  function openFacebookMessenger() {
    if (currentPlatform?.url) {
      window.open(currentPlatform.url, "_blank");
    }
  }
  
  function copyScraperScript() {
    navigator.clipboard.writeText(SCRAPER_SCRIPT_CONTENT).then(() => {
      setTestResult("✅ 腳本已複製到剪貼簿！\n\n請在 Facebook Messenger 頁面按 F12 開啟開發者工具，切換到 Console 標籤，貼上腳本後按 Enter 執行。");
    }).catch(() => {
      setTestResult("⚠️ 無法複製腳本，請手動複製");
    });
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
              <div className="flex gap-3 flex-wrap">
                <button className="btn-primary text-sm" onClick={handleTestSelectors}>
                  🔍 測試選擇器
                </button>
                <button className="btn-secondary text-sm" onClick={handleOpenPlatform}>
                  🌐 開啟平台網頁
                </button>
                {currentPlatform?.platform === "facebook" && (
                  <button 
                    className="btn-secondary text-sm" 
                    onClick={handleFetchConversations}
                    style={{ background: "rgba(79,142,247,0.15)", borderColor: "rgba(79,142,247,0.3)" }}
                  >
                    📥 擷取對話列表
                  </button>
                )}
              </div>
              <div
                className="mt-3 p-3 rounded-lg text-xs"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
              >
                {testResult}
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

      {/* Scraper Modal */}
      {showScraperModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowScraperModal(false)}
        >
          <div
            className="card p-6 w-[550px] max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              📥 擷取 Facebook Messenger 對話
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              自動映射您在 Facebook Messenger 頁面上看到的前 10 個對話窗口
            </p>
            
            <div className="flex gap-2 mb-4">
              <button className="btn-primary flex-1" onClick={openFacebookMessenger}>
                🚀 開啟 Facebook Messenger
              </button>
              <button className="btn-secondary flex-1" onClick={copyScraperScript}>
                📋 複製擷取腳本
              </button>
            </div>

            <div className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              使用說明：
            </div>
            <div 
              className="text-xs p-3 rounded-lg flex-1 overflow-y-auto"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
            >
              <ol className="list-decimal list-inside space-y-1.5">
                <li>點擊「開啟 Facebook Messenger」打開新分頁</li>
                <li>登入您的 Facebook 帳號（如果還沒登入）</li>
                <li>確保您可以看到對話列表頁面</li>
                <li>點擊「複製擷取腳本」按鈕</li>
                <li>按 <kbd style={{ background: "#333", padding: "2px 6px", borderRadius: "4px" }}>F12</kbd> 開啟開發者工具</li>
                <li>切換到 <kbd style={{ background: "#333", padding: "2px 6px", borderRadius: "4px" }}>Console</kbd> 標籤</li>
                <li>貼上腳本並按 <kbd style={{ background: "#333", padding: "2px 6px", borderRadius: "4px" }}>Enter</kbd></li>
                <li>腳本會自動擷取對話並發送到 AutoReply Pro！</li>
              </ol>
              <div className="mt-3 p-2 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                💡 <strong>提示：</strong>您可以將腳本儲存為 Tampermonkey 用戶腳本，這樣每次打開 Messenger 都會自動擷取對話。
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-secondary flex-1" onClick={() => setShowScraperModal(false)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
