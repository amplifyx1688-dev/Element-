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
