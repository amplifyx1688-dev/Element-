"use client";

import { useState } from "react";
import { AutoReplyStore } from "@/lib/store";
import { KeywordRule, PLATFORM_META, Platform, MatchMode, ReplyMode, Priority } from "@/lib/types";

interface KeywordRulesProps {
  store: AutoReplyStore;
}

const PRIORITY_META = {
  high: { label: "高優先", color: "var(--accent-red)", bg: "rgba(239,68,68,0.15)" },
  medium: { label: "中優先", color: "var(--accent-yellow)", bg: "rgba(245,158,11,0.15)" },
  low: { label: "低優先", color: "var(--text-secondary)", bg: "rgba(148,163,184,0.1)" },
};

const MATCH_MODE_META: Record<MatchMode, string> = {
  exact: "完全匹配",
  contains: "包含關鍵字",
  regex: "正則表達式",
  fuzzy: "模糊匹配",
};

const REPLY_MODE_META: Record<ReplyMode, { label: string; color: string }> = {
  auto: { label: "自動發送", color: "var(--accent-green)" },
  suggest: { label: "建議回覆", color: "var(--accent-blue)" },
  manual: { label: "手動回覆", color: "var(--text-secondary)" },
};

export default function KeywordRules({ store }: KeywordRulesProps) {
  const { rules, toggleRule, updateRule, addRule, deleteRule } = store;
  const [selectedRule, setSelectedRule] = useState<string | null>(rules[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");

  const currentRule = rules.find(r => r.id === selectedRule);
  const filteredRules = rules.filter(r =>
    filterPriority === "all" ? true : r.priority === filterPriority
  );

  function handleAddKeyword(ruleId: string, keyword: string) {
    if (!keyword.trim()) return;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { keywords: [...rule.keywords, keyword.trim()] });
    setNewKeyword("");
  }

  function handleRemoveKeyword(ruleId: string, keyword: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { keywords: rule.keywords.filter(k => k !== keyword) });
  }

  function handleUpdateResponse(ruleId: string, respId: string, content: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      responses: rule.responses.map(r => r.id === respId ? { ...r, content } : r),
    });
  }

  function handleAddResponse(ruleId: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      responses: [...rule.responses, {
        id: `resp_${Date.now()}`,
        content: "",
        weight: 5,
      }],
    });
  }

  function handleRemoveResponse(ruleId: string, respId: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      responses: rule.responses.filter(r => r.id !== respId),
    });
  }

  function handleCreateRule() {
    const newRule: KeywordRule = {
      id: `r_${Date.now()}`,
      name: "新規則",
      enabled: true,
      priority: "medium",
      platforms: ["shopee"],
      keywords: [],
      matchMode: "contains",
      caseSensitive: false,
      contextLines: 2,
      responses: [{ id: `resp_${Date.now()}`, content: "", weight: 5 }],
      replyMode: "suggest",
      delay: 2000,
      cooldown: 300,
      tags: [],
      stats: { triggered: 0 },
    };
    addRule(newRule);
    setSelectedRule(newRule.id);
    setIsCreating(false);
  }

  function togglePlatform(ruleId: string, platform: Platform) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const platforms = rule.platforms.includes(platform)
      ? rule.platforms.filter(p => p !== platform)
      : [...rule.platforms, platform];
    updateRule(ruleId, { platforms });
  }

  return (
    <div className="flex h-full animate-fade-in">
      {/* Rules List */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: "var(--border-color)" }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              關鍵字規則
            </h2>
            <button onClick={handleCreateRule} className="btn-primary text-xs px-3 py-1.5">
              + 新增
            </button>
          </div>
          {/* Priority Filter */}
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all"
                style={{
                  background: filterPriority === p ? "rgba(79,142,247,0.15)" : "transparent",
                  color: filterPriority === p ? "var(--accent-blue)" : "var(--text-secondary)",
                  border: filterPriority === p ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
                }}
              >
                {p === "all" ? "全部" : p === "high" ? "高" : p === "medium" ? "中" : "低"}
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="flex-1 overflow-y-auto">
          {filteredRules.map(rule => {
            const pm = PRIORITY_META[rule.priority];
            const isSelected = selectedRule === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => setSelectedRule(rule.id)}
                className="w-full p-4 text-left border-b transition-all"
                style={{
                  borderColor: "var(--border-color)",
                  background: isSelected ? "rgba(79,142,247,0.08)" : "transparent",
                  borderLeft: isSelected ? "3px solid var(--accent-blue)" : "3px solid transparent",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {rule.name}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: rule.enabled ? "var(--accent-green)" : "#374151" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: pm.bg, color: pm.color }}
                  >
                    {pm.label}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: REPLY_MODE_META[rule.replyMode].color }}
                  >
                    {REPLY_MODE_META[rule.replyMode].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rule.keywords.slice(0, 3).map(kw => (
                    <span key={kw} className="tag tag-blue text-xs">{kw}</span>
                  ))}
                  {rule.keywords.length > 3 && (
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      +{rule.keywords.length - 3}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  觸發 {rule.stats.triggered} 次
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rule Editor */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0">
        {currentRule ? (
          <div className="max-w-2xl space-y-6">
            {/* Rule Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  className="input-dark text-lg font-semibold bg-transparent border-0 border-b px-0 rounded-none"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  value={currentRule.name}
                  onChange={e => updateRule(currentRule.id, { name: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={currentRule.enabled}
                    onChange={() => toggleRule(currentRule.id)}
                  />
                  <span className="toggle-slider" />
                </label>
                <button
                  className="btn-danger text-xs px-3 py-1.5"
                  onClick={() => {
                    deleteRule(currentRule.id);
                    setSelectedRule(rules.find(r => r.id !== currentRule.id)?.id || null);
                  }}
                >
                  🗑️ 刪除
                </button>
              </div>
            </div>

            {/* Basic Settings */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>基本設定</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    優先級
                  </label>
                  <select
                    className="input-dark w-full text-sm"
                    value={currentRule.priority}
                    onChange={e => updateRule(currentRule.id, { priority: e.target.value as Priority })}
                  >
                    <option value="high">高優先</option>
                    <option value="medium">中優先</option>
                    <option value="low">低優先</option>
                  </select>
                </div>
                {/* Reply Mode */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    回覆模式
                  </label>
                  <select
                    className="input-dark w-full text-sm"
                    value={currentRule.replyMode}
                    onChange={e => updateRule(currentRule.id, { replyMode: e.target.value as ReplyMode })}
                  >
                    <option value="auto">自動發送</option>
                    <option value="suggest">建議回覆（需確認）</option>
                    <option value="manual">手動回覆</option>
                  </select>
                </div>
                {/* Match Mode */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    匹配模式
                  </label>
                  <select
                    className="input-dark w-full text-sm"
                    value={currentRule.matchMode}
                    onChange={e => updateRule(currentRule.id, { matchMode: e.target.value as MatchMode })}
                  >
                    {Object.entries(MATCH_MODE_META).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                {/* Delay */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    回覆延遲 (ms)
                  </label>
                  <input
                    type="number"
                    className="input-dark w-full text-sm"
                    value={currentRule.delay}
                    min={0}
                    max={30000}
                    step={500}
                    onChange={e => updateRule(currentRule.id, { delay: Number(e.target.value) })}
                  />
                </div>
              </div>
              {/* Case Sensitive */}
              <div className="flex items-center gap-3">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={currentRule.caseSensitive}
                    onChange={() => updateRule(currentRule.id, { caseSensitive: !currentRule.caseSensitive })}
                  />
                  <span className="toggle-slider" />
                </label>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>區分大小寫</span>
              </div>
            </div>

            {/* Platforms */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>適用平台</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PLATFORM_META) as [Platform, typeof PLATFORM_META[Platform]][]).map(([platform, meta]) => {
                  const isActive = currentRule.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(currentRule.id, platform)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: isActive ? `${meta.color}22` : "var(--bg-secondary)",
                        color: isActive ? meta.color : "var(--text-secondary)",
                        border: `1px solid ${isActive ? `${meta.color}44` : "var(--border-color)"}`,
                      }}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keywords */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
                觸發關鍵字
                <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-secondary)" }}>
                  ({currentRule.keywords.length} 個)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentRule.keywords.map(kw => (
                  <span
                    key={kw}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm"
                    style={{ background: "rgba(79,142,247,0.15)", color: "var(--accent-blue)", border: "1px solid rgba(79,142,247,0.3)" }}
                  >
                    {kw}
                    <button
                      onClick={() => handleRemoveKeyword(currentRule.id, kw)}
                      className="ml-1 text-xs opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input-dark flex-1 text-sm"
                  placeholder="輸入關鍵字後按 Enter 或點擊新增"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAddKeyword(currentRule.id, newKeyword);
                  }}
                />
                <button
                  className="btn-primary text-sm px-4"
                  onClick={() => handleAddKeyword(currentRule.id, newKeyword)}
                >
                  新增
                </button>
              </div>
            </div>

            {/* Response Templates */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  回覆模板
                  <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-secondary)" }}>
                    多個模板將隨機選擇
                  </span>
                </h3>
                <button
                  className="btn-secondary text-xs px-3 py-1.5"
                  onClick={() => handleAddResponse(currentRule.id)}
                >
                  + 新增模板
                </button>
              </div>
              <div className="space-y-3">
                {currentRule.responses.map((resp, idx) => (
                  <div key={resp.id} className="p-3 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        模板 {idx + 1}
                      </span>
                      {currentRule.responses.length > 1 && (
                        <button
                          className="text-xs"
                          style={{ color: "var(--accent-red)" }}
                          onClick={() => handleRemoveResponse(currentRule.id, resp.id)}
                        >
                          刪除
                        </button>
                      )}
                    </div>
                    <textarea
                      className="input-dark w-full text-sm resize-none"
                      rows={3}
                      placeholder="輸入回覆內容... 可使用 {{customer_name}} 等變數"
                      value={resp.content}
                      onChange={e => handleUpdateResponse(currentRule.id, resp.id, e.target.value)}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>權重：</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={resp.weight}
                        className="flex-1"
                        onChange={e => {
                          const rule = rules.find(r => r.id === currentRule.id);
                          if (!rule) return;
                          updateRule(currentRule.id, {
                            responses: rule.responses.map(r =>
                              r.id === resp.id ? { ...r, weight: Number(e.target.value) } : r
                            ),
                          });
                        }}
                      />
                      <span className="text-xs font-semibold w-4" style={{ color: "var(--accent-blue)" }}>
                        {resp.weight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-3 p-3 rounded-lg text-xs"
                style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "var(--text-secondary)" }}
              >
                💡 可用變數：<code style={{ color: "var(--accent-purple)" }}>{"{{customer_name}}"}</code>、
                <code style={{ color: "var(--accent-purple)" }}>{"{{platform}}"}</code>、
                <code style={{ color: "var(--accent-purple)" }}>{"{{time}}"}</code>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>統計資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>
                    {currentRule.stats.triggered}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>累計觸發次數</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {currentRule.stats.lastTriggered
                      ? new Date(currentRule.stats.lastTriggered).toLocaleString("zh-TW")
                      : "從未觸發"}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>最後觸發時間</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>選擇一條規則進行編輯</p>
              <button className="btn-primary" onClick={handleCreateRule}>
                + 建立第一條規則
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
