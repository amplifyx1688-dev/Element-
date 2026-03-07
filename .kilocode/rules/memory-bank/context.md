# Active Context: AutoReply Pro - 跨平台自動化應答系統

## Current State

**Project Status**: ✅ AutoReply Pro 完整系統已建立

已從 Next.js 基礎模板擴展為完整的跨平台自動化應答系統，靈感來自 "Helloworld跨境屯商助手"，並加入了自動分析未讀訊息的功能。

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **AutoReply Pro 完整系統**
  - [x] 深色主題 UI 設計系統（globals.css）
  - [x] 資料類型定義（src/lib/types.ts）
  - [x] 狀態管理 Store（src/lib/store.ts）
  - [x] 側邊欄導航（src/components/Sidebar.tsx）
  - [x] 總覽儀表板（src/components/Dashboard.tsx）
  - [x] 對話監控（src/components/ConversationMonitor.tsx）
  - [x] 關鍵字規則管理（src/components/KeywordRules.tsx）
  - [x] 平台設定（src/components/PlatformSettings.tsx）
  - [x] RPA 自動化腳本（src/components/RPAAutomation.tsx）
  - [x] 主應用殼層（src/components/AppShell.tsx）
- [x] **可收合側邊欄 + 頂部應用切換按鈕**
  - [x] Sidebar 自管理 `collapsed` 狀態（useState）
  - [x] 展開寬度 256px / 收合寬度 64px，`transition: width 0.3s ease`
  - [x] 頂部 ◀/▶ 切換按鈕
  - [x] 收合時只顯示 emoji 圖示，展開時顯示圖示 + 文字標籤
  - [x] 未讀訊息角標在收合模式下以絕對定位顯示
  - [x] 監控狀態在收合模式下以點擊圓點切換
- [x] **平台切換 + 對話列表**
  - [x] 新增 `selectedPlatform` 狀態到 store.ts
  - [x] 側邊欄頂部：平台標籤（蝦皮、Lazada、FB、LINE、全部）
  - [x] 平台標籤顯示未讀數量角標
  - [x] 中間區域：顯示所選平台的對話列表
  - [x] 應用導航移到側邊欄底部（Dashboard、對話監控等）
  - [x] ConversationMonitor 響應 selectedPlatform 過濾對話
- [x] **對話監控頁面簡化**
  - [x] 移除買家 "Amy Chen" 和 "買家 阿花" 樣本資料
  - [x] 移除篩選按鈕（全部、未讀、進行中）
  - [x] 移除側邊欄對話列表（聯絡人欄位）
- [x] **對話監控頁面重構**
  - [x] 對話監控頁面加入「離線模式」狀態顯示
  - [x] 左側加入對話列表（可選擇不同聯絡人）
  - [x] 對話聊天窗口在左側（對話列表右邊）
  - [x] 右側新增可收合的「快捷語」面板（現代科技感設計）
  - [x] 快捷語面板可釘選、收合、展開
  - [x] 快捷語搜尋功能
  - [x] 快捷語分類顯示（問候、訂單、物流、抱歉、優惠）
- [x] **修復按鈕功能**
  - [x] PlatformSettings 添加平台按鈕現可實際添加平台
  - [x] ConversationMonitor 快捷語按鈕現有點擊事件
  - [x] PlatformSettings 測試連接和開啟平台網頁按鈕功能修復
- [x] **修復網頁被屏蔽問題**
  - [x] 使用 a 標籤模擬點擊打開網頁，取代 window.open() 避免被瀏覽器屏蔽
  - [x] 完全移除 window.open，改用純剪貼簿複製網址（避免瀏覽器 ERR_BLOCKED_BY_RESPONSE 錯誤）
- [x] **修復測試連接功能**
  - [x] 優化測試連接邏輯，檢查選擇器是否已配置
  - [x] 為 Facebook、Lazada、LINE 平台添加默認 CSS 選擇器
  - [x] 測試結果改為顯示在區域中而非彈出 alert
- [x] **更新 Facebook Messenger 選擇器**
  - [x] 根據用戶提供的選擇器更新 Facebook 的 CSS 選擇器
  - [x] 新選擇器：messageList: .x1xzczws > div > .x1n2onr6
  - [x] 新選擇器：messageItem: .x1xzczws > div > .x1n2onr6 > div
  - [x] 新選擇器：inputBox: .x16sw7j7 > .x78zum5
  - [x] 新選擇器：sendButton: .xsrhx6k
  - [x] 新選擇器：unreadBadge: .x1n2onr6:nth-child(3)
- [x] **添加心跳 + 日誌系統** (2026-03-07)
  - [x] 新增 LogEntry、HeartbeatStatus、SystemStatus 類型定義
  - [x] 在 store.ts 中添加日誌功能 (addLog, clearLogs, getLogsByCategory)
  - [x] 在 store.ts 中添加心跳功能 (startHeartbeat, stopHeartbeat, beat)
  - [x] 新增 LogPanel 組件: 支援分類/平台篩選、搜尋、自動滾動
  - [x] 在 Dashboard 顯示心跳計數、系統運行時間
  - [x] 在 AppShell 整合心跳定時器，監控啟動時自動記錄日誌
  - [x] 在側邊欄添加「系統日誌」頁籤
- [x] **修復 RPA 腳本正則表達式語法錯誤** (2026-03-07)
  - [x] 修復 processVariables 函數中的 replace 語法：/\\{{name}}\\/g → /\\{\\{name\\}\\}\\/g
  - [x] 修復 Dashboard.tsx 缺少 uptimeSeconds 狀態宣告的問題
  - [x] 移除 useEffect 中直接呼叫 setState 的 ESLint 警告

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | 主頁面（載入 AppShell） | ✅ Ready |
| `src/app/layout.tsx` | Root layout（中文標題） | ✅ Ready |
| `src/app/globals.css` | 深色主題設計系統 | ✅ Ready |
| `src/lib/types.ts` | 所有 TypeScript 類型定義 | ✅ Ready |
| `src/lib/store.ts` | React 狀態管理 Hook | ✅ Ready |
| `src/components/AppShell.tsx` | 主應用殼層（路由切換） | ✅ Ready |
| `src/components/Sidebar.tsx` | 側邊欄導航 + 監控開關 | ✅ Ready |
| `src/components/Dashboard.tsx` | 總覽儀表板 + 統計 | ✅ Ready |
| `src/components/ConversationMonitor.tsx` | 對話監控 + 回覆操作 | ✅ Ready |
| `src/components/KeywordRules.tsx` | 關鍵字規則 CRUD | ✅ Ready |
| `src/components/PlatformSettings.tsx` | 平台 CSS 選擇器設定 | ✅ Ready |
| `src/components/RPAAutomation.tsx` | RPA 腳本生成 + 說明 | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## System Features

### 核心功能
1. **自動偵測對話窗口** - 透過 CSS 選擇器監控目標平台的訊息列表
2. **自動分析上下文** - 關鍵字匹配引擎（完全/包含/正則/模糊）
3. **自動化關鍵字回應** - 三種模式：自動發送、建議回覆、手動回覆

### 支援平台
- 蝦皮購物（Shopee）
- Lazada
- Tokopedia
- Facebook Messenger
- Instagram
- LINE Official
- WhatsApp
- Telegram
- 自訂平台（任意網頁）

### RPA 實現方式
- **控制台注入**：在目標網頁 F12 貼上腳本執行
- **Tampermonkey**：瀏覽器擴充功能自動執行
- **Puppeteer/Playwright**：Node.js 後端自動化

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-06 | 建立完整 AutoReply Pro 跨平台自動化應答系統 |
| 2026-03-06 | 重構對話監控頁面：加入離線模式狀態、對話窗口移至左側、右側新增可收合快捷語面板 |
| 2026-03-06 | 對話監控頁面加入左側對話列表（可選擇不同聯絡人），對話詳情在右側 |
| 2026-03-06 | 修復測試連接功能：完善邏輯檢查選擇器配置，並為所有平台添加默認CSS選擇器 |
| 2026-03-07 | 添加心跳 + 日誌系統：新增 LogEntry、HeartbeatStatus 類型，新增 LogPanel 組件，Dashboard 顯示心跳計數和運行時間 |
| 2026-03-07 | 修復 RPA 腳本正則表達式語法錯誤：processVariables 函數中的 replace 語法修復，Dashboard 運行時間狀態修復 |
