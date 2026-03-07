"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";

interface RPAAutomationProps {
  store: AutoReplyStore;
}

export default function RPAAutomation({ store }: RPAAutomationProps) {
  const { platforms, rules, isMonitoring } = store;
  const [activeScriptTab, setActiveScriptTab] = useState<"console" | "tampermonkey" | "puppeteer">("console");
  const [copiedScript, setCopiedScript] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("");

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const enabledRules = rules.filter(r => r.enabled);
  
  // 找出有設定選擇器的平台
  const platformsWithSelectors = platforms.filter(p => p.selectors?.messageList || p.selectors?.messageItem || p.selectors?.inputBox);
  
  // 自動選擇第一個有選擇器的平台
  const selectedPlatform = selectedPlatformId 
    ? platforms.find(p => p.id === selectedPlatformId) 
    : platformsWithSelectors[0] || platforms[0];
  
  // 確保 selectedPlatform 永遠有值
  const safeSelectedPlatform = selectedPlatform || {
    id: 'default',
    platform: 'custom' as const,
    name: '自訂平台',
    enabled: true,
    checkInterval: 5,
    color: '#6366f1',
    icon: '🌐',
    selectors: {}
  };

  // 動態生成 RPA 腳本，使用選擇的平台選擇器
  function generateDynamicRPA(platform: typeof platforms[0]) {
    const selectors = platform.selectors || {};
    return `// ============================================================
// AutoReply Pro - RPA Browser Script v1.0
// 平台: ${platform.name}
// 將此腳本注入到目標網頁的瀏覽器控制台執行
// 或使用 Tampermonkey / Greasemonkey 等擴充功能自動執行
// ============================================================

(function() {
  'use strict';

  // ---- 設定區域 ----
  const CONFIG = {
    // 從 AutoReply Pro 系統匯出的規則
    rules: [], // 將從系統自動填入
    
    // 平台選擇器（從平台設定頁面配置）
    selectors: {
      messageList: '${selectors.messageList || '.chat-list'}',
      messageItem: '${selectors.messageItem || '.chat-item'}',
      inputBox: '${selectors.inputBox || '.chat-input textarea'}',
      sendButton: '${selectors.sendButton || '.send-btn'}',
      unreadBadge: '${selectors.unreadBadge || '.unread-count'}',
    },
    
    // 監控間隔（毫秒）
    checkInterval: ${platform.checkInterval * 1000 || 5000},
    
    // 是否啟用自動發送（false = 只顯示建議）
    autoSend: false,
    
    // 回覆前延遲（模擬人工輸入）
    replyDelay: 2000,
  };

  console.log('[AutoReply Pro] 🤖 已啟動，監控間隔:', CONFIG.checkInterval + 'ms');
  console.log('[AutoReply Pro] 📋 選擇器設定:', JSON.stringify(CONFIG.selectors, null, 2));

  // ---- 核心邏輯 ----
  let lastMessageCount = 0;
  let isRunning = false;

  function matchKeywords(text, rule) {
    const normalizedText = rule.caseSensitive ? text : text.toLowerCase();
    return rule.keywords.some(keyword => {
      const normalizedKeyword = rule.caseSensitive ? keyword : keyword.toLowerCase();
      switch (rule.matchMode) {
        case 'exact': return normalizedText === normalizedKeyword;
        case 'contains': return normalizedText.includes(normalizedKeyword);
        case 'regex': return new RegExp(keyword, rule.caseSensitive ? '' : 'i').test(text);
        case 'fuzzy': return normalizedText.includes(normalizedKeyword.substring(0, Math.floor(normalizedKeyword.length * 0.8)));
        default: return false;
      }
    });
  }

  function selectResponse(responses) {
    const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const resp of responses) {
      random -= resp.weight;
      if (random <= 0) return resp.content;
    }
    return responses[0]?.content || '';
  }

  function processVariables(template, context) {
    return template
      .replace(/\\{\\{customer_name\\}\\}\\/g, context.customerName || '您')
      .replace(/\\{\\{platform\\}\\}\\/g, context.platform || '')
      .replace(/\\{\\{time\\}\\}\\/g, new Date().toLocaleTimeString('zh-TW'));
  }

  function sendReply(inputSelector, sendSelector, message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const input = document.querySelector(inputSelector);
        const sendBtn = document.querySelector(sendSelector);
        
        if (!input || !sendBtn) {
          console.warn('[AutoReply] 找不到輸入框或發送按鈕，選擇器:', inputSelector, sendSelector);
          resolve(false);
          return;
        }

        // 模擬人工輸入
        input.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, 'value'
        )?.set;
        nativeInputValueSetter?.call(input, message);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          sendBtn.click();
          console.log('[AutoReply] ✓ 已發送回覆:', message.substring(0, 50) + '...');
          resolve(true);
        }, 500);
      }, CONFIG.replyDelay);
    });
  }

  async function checkNewMessages() {
    if (isRunning) return;
    isRunning = true;

    try {
      const messageListEl = document.querySelector(CONFIG.selectors.messageList);
      if (!messageListEl) {
        console.warn('[AutoReply] 找不到訊息列表，選擇器:', CONFIG.selectors.messageList);
        return;
      }
      
      const messages = messageListEl.querySelectorAll(CONFIG.selectors.messageItem);
      console.log('[AutoReply] 檢測到', messages.length, '條訊息');
      
      if (messages.length > lastMessageCount) {
        const newMessages = Array.from(messages).slice(lastMessageCount);
        
        for (const msgEl of newMessages) {
          const text = msgEl.textContent?.trim() || '';
          if (!text) continue;

          // 找到匹配的規則（按優先級排序）
          const sortedRules = [...CONFIG.rules]
            .filter(r => r.enabled)
            .sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

          for (const rule of sortedRules) {
            if (matchKeywords(text, rule)) {
              const response = selectResponse(rule.responses);
              const finalResponse = processVariables(response, { platform: 'current' });
              
              console.log('[AutoReply] 🎯 匹配規則:', rule.name);
              console.log('[AutoReply] 💬 收到訊息:', text);
              console.log('[AutoReply] 💡 建議回覆:', finalResponse);

              if (CONFIG.autoSend && rule.replyMode === 'auto') {
                await sendReply(
                  CONFIG.selectors.inputBox,
                  CONFIG.selectors.sendButton,
                  finalResponse
                );
              } else {
                // 顯示建議（在控制台）
                console.log('[AutoReply] 📋 請手動發送以上回覆，或設定 autoSend: true 自動發送');
              }
              break; // 只匹配第一條規則
            }
          }
        }
        
        lastMessageCount = messages.length;
      }
    } finally {
      isRunning = false;
    }
  }

  // ---- 啟動監控 ----
  console.log('[AutoReply Pro] ✅ 腳本載入成功，請確保已設定關鍵字規則');
  
  const intervalId = setInterval(checkNewMessages, CONFIG.checkInterval);
  
  // 提供停止方法
  window.autoReplyStop = () => {
    clearInterval(intervalId);
    console.log('[AutoReply Pro] ⏹️ 已停止監控');
  };
  
  console.log('[AutoReply Pro] 輸入 autoReplyStop() 可停止監控');
})();`;
  }

  // 動態生成 Tampermonkey 腳本
  function generateTampermonkey(platform: typeof platforms[0]) {
    const urlMatch = platform.url ? `// @match        ${platform.url}/*` : '';
    return `// ==UserScript==
// @name         AutoReply Pro - ${platform.name}
// @namespace    https://autoreply.pro
// @version      1.0
// @description  跨平台自動化應答系統 - ${platform.name}
// @author       AutoReply Pro
${urlMatch}
// @grant        none
// ==/UserScript==

/* 將上方 RPA 腳本內容貼在這裡 */`;
  }

  function handleCopyScript() {
    const script = activeScriptTab === "tampermonkey" 
      ? generateTampermonkey(safeSelectedPlatform) 
      : generateDynamicRPA(safeSelectedPlatform);
    navigator.clipboard.writeText(script).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    });
  }

  function generateExportConfig() {
    const config = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      rules: enabledRules.map(r => ({
        id: r.id,
        name: r.name,
        enabled: r.enabled,
        priority: r.priority,
        keywords: r.keywords,
        matchMode: r.matchMode,
        caseSensitive: r.caseSensitive,
        responses: r.responses,
        replyMode: r.replyMode,
        delay: r.delay,
      })),
      platforms: enabledPlatforms.map(p => ({
        id: p.id,
        platform: p.platform,
        name: p.name,
        url: p.url,
        selectors: p.selectors,
        checkInterval: p.checkInterval,
      })),
    };
    return JSON.stringify(config, null, 2);
  }

  function handleExportConfig() {
    const config = generateExportConfig();
    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autoreply-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const STEPS = [
    {
      step: "01",
      title: "設定平台選擇器",
      desc: "在「平台設定」頁面，為每個目標平台配置 CSS 選擇器，讓腳本知道在哪裡找到訊息輸入框和發送按鈕。",
      icon: "🎯",
      status: enabledPlatforms.some(p => p.selectors?.inputBox) ? "done" : "pending",
    },
    {
      step: "02",
      title: "建立關鍵字規則",
      desc: "在「關鍵字規則」頁面建立觸發詞和對應回覆。設定優先級和回覆模式（自動/建議/手動）。",
      icon: "⚡",
      status: enabledRules.length > 0 ? "done" : "pending",
    },
    {
      step: "03",
      title: "匯出設定檔",
      desc: "點擊「匯出設定」按鈕，下載包含所有規則和平台設定的 JSON 設定檔。",
      icon: "📦",
      status: "pending",
    },
    {
      step: "04",
      title: "注入 RPA 腳本",
      desc: "複製下方腳本，在目標平台網頁按 F12 開啟控制台，貼上並執行。或使用 Tampermonkey 自動執行。",
      icon: "🤖",
      status: "pending",
    },
    {
      step: "05",
      title: "開啟監控",
      desc: "在側邊欄開啟監控開關，系統將開始自動偵測未讀訊息並根據規則回覆。",
      icon: "👁️",
      status: isMonitoring ? "done" : "pending",
    },
  ];

  const TOOLS = [
    {
      name: "Tampermonkey",
      desc: "瀏覽器擴充功能，可自動在指定網頁執行腳本",
      icon: "🐒",
      url: "https://www.tampermonkey.net/",
      recommended: true,
    },
    {
      name: "Puppeteer",
      desc: "Node.js 自動化框架，適合進階用戶",
      icon: "🎭",
      url: "https://pptr.dev/",
      recommended: false,
    },
    {
      name: "Playwright",
      desc: "微軟出品的跨瀏覽器自動化工具",
      icon: "🎪",
      url: "https://playwright.dev/",
      recommended: false,
    },
    {
      name: "n8n",
      desc: "無程式碼工作流程自動化平台",
      icon: "🔄",
      url: "https://n8n.io/",
      recommended: false,
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>RPA 自動化</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            瀏覽器自動化腳本 · 支援任意網頁平台
          </p>
        </div>
        <button className="btn-primary" onClick={handleExportConfig}>
          📦 匯出設定檔
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="text-2xl">🌐</div>
          <div>
            <div className="text-xl font-bold" style={{ color: "var(--accent-blue)" }}>
              {enabledPlatforms.length}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>已啟用平台</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="text-2xl">⚡</div>
          <div>
            <div className="text-xl font-bold" style={{ color: "var(--accent-green)" }}>
              {enabledRules.length}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>啟用規則</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="text-2xl">{isMonitoring ? "🟢" : "🔴"}</div>
          <div>
            <div className="text-xl font-bold" style={{ color: isMonitoring ? "var(--accent-green)" : "var(--accent-red)" }}>
              {isMonitoring ? "運行中" : "已停止"}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>監控狀態</div>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>🚀 設定步驟</h2>
        <div className="space-y-3">
          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{
                background: step.status === "done" ? "rgba(34,197,94,0.05)" : "var(--bg-secondary)",
                border: `1px solid ${step.status === "done" ? "rgba(34,197,94,0.2)" : "var(--border-color)"}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: step.status === "done" ? "rgba(34,197,94,0.2)" : "rgba(148,163,184,0.1)",
                  color: step.status === "done" ? "var(--accent-green)" : "var(--text-secondary)",
                }}
              >
                {step.status === "done" ? "✓" : step.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{step.icon}</span>
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </span>
                  {step.status === "done" && (
                    <span className="tag tag-green text-xs">已完成</span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Script Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>📜 RPA 腳本</h2>
          <button
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${copiedScript ? "btn-primary" : "btn-secondary"}`}
            onClick={handleCopyScript}
          >
            {copiedScript ? "✓ 已複製！" : "📋 複製腳本"}
          </button>
        </div>

        {/* Platform Selector */}
        {platformsWithSelectors.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              選擇平台（腳本將使用該平台的 CSS 選擇器）
            </label>
            <select
              value={safeSelectedPlatform.id || ""}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ 
                background: "var(--bg-secondary)", 
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)" 
              }}
            >
              {platformsWithSelectors.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} {p.selectors?.inputBox ? "✅" : "⚠️"}
                </option>
              ))}
            </select>
            {safeSelectedPlatform.selectors?.inputBox && (
              <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <span style={{ color: "var(--accent-green)" }}>✓ 選擇器已設定</span>
                <div className="mt-1" style={{ color: "var(--text-secondary)" }}>
                  inputBox: <code className="px-1 rounded" style={{ background: "rgba(0,0,0,0.2)" }}>{safeSelectedPlatform.selectors.inputBox}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Script Tabs */}
        <div className="flex gap-1 mb-4">
          {(["console", "tampermonkey", "puppeteer"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveScriptTab(tab)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeScriptTab === tab ? "rgba(79,142,247,0.15)" : "transparent",
                color: activeScriptTab === tab ? "var(--accent-blue)" : "var(--text-secondary)",
                border: activeScriptTab === tab ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
              }}
            >
              {tab === "console" ? "🖥️ 控制台注入" : tab === "tampermonkey" ? "🐒 Tampermonkey" : "🎭 Puppeteer"}
            </button>
          ))}
        </div>

        {activeScriptTab === "console" && (
          <div>
            <div
              className="p-3 rounded-lg text-xs mb-3"
              style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent-blue)" }}
            >
              📌 使用方法：在目標平台網頁按 <kbd className="px-1 py-0.5 rounded" style={{ background: "rgba(79,142,247,0.2)" }}>F12</kbd> → 控制台 → 貼上腳本 → 按 Enter 執行
            </div>
            <pre
              className="p-4 rounded-xl text-xs overflow-x-auto"
              style={{
                background: "#0d1117",
                color: "#e6edf3",
                border: "1px solid var(--border-color)",
                fontFamily: "var(--font-geist-mono), monospace",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {generateDynamicRPA(safeSelectedPlatform)}
            </pre>
          </div>
        )}

        {activeScriptTab === "tampermonkey" && (
          <div>
            <div
              className="p-3 rounded-lg text-xs mb-3"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--accent-green)" }}
            >
              ✅ 推薦方式：安裝 Tampermonkey 擴充功能後，新增腳本並貼上以下內容，可在指定網頁自動執行
            </div>
            <pre
              className="p-4 rounded-xl text-xs overflow-x-auto"
              style={{
                background: "#0d1117",
                color: "#e6edf3",
                border: "1px solid var(--border-color)",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            >
              {generateTampermonkey(safeSelectedPlatform)}
            </pre>
          </div>
        )}

        {activeScriptTab === "puppeteer" && (
          <div
            className="p-6 rounded-xl text-center"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            <div className="text-3xl mb-3">🎭</div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Puppeteer / Playwright 腳本
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              適合需要更複雜自動化邏輯的進階用戶，可搭配 Node.js 後端使用
            </p>
            <button className="btn-primary text-sm">
              📥 下載 Node.js 腳本
            </button>
          </div>
        )}
      </div>

      {/* Recommended Tools */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>🛠️ 推薦工具</h2>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(tool => (
            <div
              key={tool.name}
              className="p-4 rounded-xl card-hover"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${tool.recommended ? "rgba(79,142,247,0.3)" : "var(--border-color)"}`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {tool.name}
                    </span>
                    {tool.recommended && (
                      <span className="tag tag-blue text-xs">推薦</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tool.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--accent-yellow)" }}>
          ⚠️ 重要注意事項
        </h3>
        <ul className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <li>• 使用自動化工具前，請確認目標平台的服務條款是否允許</li>
          <li>• 建議先使用「建議回覆」模式，確認效果後再開啟「自動發送」</li>
          <li>• 設定適當的回覆延遲（2-5秒），避免被平台偵測為機器人</li>
          <li>• 定期檢查回覆品質，確保關鍵字規則符合實際需求</li>
          <li>• 此工具僅供輔助，複雜問題仍需人工介入處理</li>
        </ul>
      </div>
    </div>
  );
}
