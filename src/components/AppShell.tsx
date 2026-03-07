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
