"use client";

import { useAutoReplyStore } from "@/lib/store";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ConversationMonitor from "./ConversationMonitor";
import KeywordRules from "./KeywordRules";
import PlatformSettings from "./PlatformSettings";
import RPAAutomation from "./RPAAutomation";

export default function AppShell() {
  const store = useAutoReplyStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar store={store} />
      <main className="flex-1 overflow-hidden">
        {store.activeTab === "dashboard" && <div className="h-full overflow-y-auto"><Dashboard store={store} /></div>}
        {store.activeTab === "conversations" && <div className="h-full"><ConversationMonitor store={store} /></div>}
        {store.activeTab === "rules" && <div className="h-full"><KeywordRules store={store} /></div>}
        {store.activeTab === "platforms" && <div className="h-full"><PlatformSettings store={store} /></div>}
        {store.activeTab === "rpa" && <div className="h-full overflow-y-auto"><RPAAutomation store={store} /></div>}
      </main>
    </div>
  );
}
