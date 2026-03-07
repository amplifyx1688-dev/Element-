"use client";

import { useEffect, useRef } from "react";
import { useAutoReplyStore } from "@/lib/store";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ConversationMonitor from "./ConversationMonitor";
import KeywordRules from "./KeywordRules";
import PlatformSettings from "./PlatformSettings";
import RPAAutomation from "./RPAAutomation";
import LogPanel from "./LogPanel";

export default function AppShell() {
  const store = useAutoReplyStore();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 心跳系統定時器
  useEffect(() => {
    let messageInterval: NodeJS.Timeout | null = null;
    
    if (store.isMonitoring) {
      // 啟動心跳
      if (!store.heartbeat.isAlive) {
        store.startHeartbeat(5000);
      }
      
      // 設定定時心跳
      heartbeatIntervalRef.current = setInterval(() => {
        store.beat();
      }, 5000);

      // 記錄監控啟動
      store.addLog("info", "system", "監控啟動", "開始監控各平台訊息");
      
      // 模擬定時產生訊息日誌 (每 8-15 秒隨機產生)
      const addSimulatedMessageLog = () => {
        const platforms = ["shopee", "lazada", "facebook"] as const;
        const senders = ["王小明", "李美華", "陳志強", "林怡君", "張曉東"];
        const messages = [
          "請問這個商品有現貨嗎？",
          "可以幫我修改訂單數量嗎？",
          "請問運費怎麼計算？",
          "商品什麼時候會出貨？",
          "收到商品了，謝謝！",
          "請問有折扣嗎？",
          "這個尺寸有其他顏色嗎？",
          "可以寄送到國外嗎？"
        ];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const sender = senders[Math.floor(Math.random() * senders.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // 記錄新訊息
        store.addLog("info", "message", "新訊息檢測", `${sender}: ${message}`, platform);
        
        // 30% 機率觸發自動回覆
        if (Math.random() < 0.3) {
          const replyTemplates = [
            "您好！感謝您的詢問，我們會盡快為您處理。",
            "您好！商品有現貨，可以直接下單喔！",
            "您好！一般配送時間為 2-3 個工作天，謝謝。"
          ];
          const reply = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
          store.addLog("success", "reply", "自動回覆已發送", reply, platform);
        }
      };
      
      // 啟動模擬訊息日誌 (隨機間隔 8-15 秒)
      const scheduleNextMessage = () => {
        const delay = 8000 + Math.random() * 7000;
        messageInterval = setTimeout(() => {
          addSimulatedMessageLog();
          if (store.isMonitoring) {
            scheduleNextMessage();
          }
        }, delay);
      };
      
      scheduleNextMessage();
    } else {
      // 停止心跳
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      store.stopHeartbeat();
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (messageInterval) {
        clearTimeout(messageInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isMonitoring]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)" }}>
      <Sidebar store={store} />
      <main className="flex-1 overflow-hidden">
        {store.activeTab === "dashboard" && <div className="h-full overflow-y-auto"><Dashboard store={store} /></div>}
        {store.activeTab === "conversations" && <div className="h-full"><ConversationMonitor store={store} /></div>}
        {store.activeTab === "rules" && <div className="h-full"><KeywordRules store={store} /></div>}
        {store.activeTab === "platforms" && <div className="h-full"><PlatformSettings store={store} /></div>}
        {store.activeTab === "rpa" && <div className="h-full overflow-y-auto"><RPAAutomation store={store} /></div>}
        {store.activeTab === "logs" && (
          <div className="h-full p-4">
            <LogPanel 
              logs={store.logs} 
              onClear={store.clearLogs}
            />
          </div>
        )}
      </main>
    </div>
  );
}
