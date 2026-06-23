"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send, Bot, Lightbulb, CheckCircle2, Coins, Recycle, TrainFront, Utensils, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSettings } from "@/lib/settings-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDashboard, demoTips } from "@/lib/demo-data";
import { CATEGORY_LABELS, type EmissionCategory } from "@/lib/emission-factors";
import { QuickWinsCarousel } from "@/components/quick-wins-carousel";

/* ─── Chat Types ─── */
interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: Date;
}

/* ─── Quick topics ─── */
const QUICK_TOPICS = [
  { label: "My commute", emoji: "🚗", prompt: "Analyze my daily commute carbon footprint and suggest greener alternatives for Indian cities" },
  { label: "My diet", emoji: "🍽️", prompt: "How does a typical Indian vegetarian vs non-vegetarian diet compare in carbon footprint?" },
  { label: "Home energy", emoji: "⚡", prompt: "How can I reduce my home electricity carbon footprint in India?" },
  { label: "Shopping habits", emoji: "🛍️", prompt: "What's the carbon impact of fast fashion vs sustainable clothing in India?" },
  { label: "Air travel", emoji: "✈️", prompt: "How much CO2 does a Delhi to Mumbai flight produce and how can I reduce it?" },
  { label: "Water usage", emoji: "💧", prompt: "How does my daily water consumption contribute to carbon emissions?" },
  { label: "EV switch", emoji: "🔋", prompt: "Should I switch to an electric vehicle in India? What's the carbon math?" },
  { label: "Zero waste", emoji: "♻️", prompt: "Give me a practical zero-waste plan for an Indian household" },
  { label: "Green cooking", emoji: "🍳", prompt: "Compare LPG vs induction vs solar cooking carbon footprint for Indian kitchens" },
];

const FOLLOW_UP_SUGGESTIONS = [
  "How much CO₂ does that save per year?",
  "Give me a step-by-step plan",
  "What about the cost savings?",
  "Compare with alternatives",
];

/* ─── Markdown formatting ─── */
function formatMessage(text: string) {
  const paragraphs = text.split("\n\n");
  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n");
    const isNumberedList = lines.some((l) => /^\d+[\.\)]/.test(l.trim()));
    if (isNumberedList) {
      return (
        <div key={pIdx} className="space-y-1.5 my-2">
          {lines.map((line, lIdx) => {
            const numMatch = line.match(/^(\d+[\.\)])\s*(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex gap-2.5 items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                    {numMatch[1].replace(".", "").replace(")", "")}
                  </span>
                  <span className="text-sm leading-relaxed">{formatInlineText(numMatch[2])}</span>
                </div>
              );
            }
            return <p key={lIdx} className="text-sm leading-relaxed">{formatInlineText(line)}</p>;
          })}
        </div>
      );
    }
    const isBulletList = lines.some((l) => /^[-•*]\s/.test(l.trim()));
    if (isBulletList) {
      return (
        <div key={pIdx} className="space-y-1 my-2">
          {lines.map((line, lIdx) => {
            const bulletMatch = line.match(/^[-•*]\s*(.*)/);
            if (bulletMatch) {
              return (
                <div key={lIdx} className="flex gap-2 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#52B788]" />
                  <span className="text-sm leading-relaxed">{formatInlineText(bulletMatch[1])}</span>
                </div>
              );
            }
            return <p key={lIdx} className="text-sm leading-relaxed">{formatInlineText(line)}</p>;
          })}
        </div>
      );
    }
    return <p key={pIdx} className="text-sm leading-relaxed my-1.5">{formatInlineText(para.replace(/\n/g, " "))}</p>;
  });
}

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-[#1B4332] dark:text-[#B7E4C7]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return <strong key={i} className="font-bold text-[#1B4332] dark:text-[#B7E4C7]">{part.slice(2, -2)}</strong>;
    }
    const co2Parts = part.split(/(~?\d+[\.,]?\d*\s*(?:kg|tonnes?|t)\s*CO₂?e?(?:\/(?:yr|year|month|day|km|person))?)/gi);
    return co2Parts.map((cp, j) => {
      if (/\d+.*(?:kg|tonnes?|t)\s*CO/i.test(cp)) {
        return (
          <span key={`${i}-${j}`} className="inline-flex items-center gap-1 rounded-md bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-1.5 py-0.5 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mx-0.5">
            🌿 {cp.trim()}
          </span>
        );
      }
      const rupeeParts = cp.split(/(₹[\d,]+(?:\/(?:month|year|yr))?)/gi);
      return rupeeParts.map((rp, k) => {
        if (rp.startsWith("₹")) {
          return <span key={`${i}-${j}-${k}`} className="font-bold text-[#2D6A4F] dark:text-[#52B788]">{rp}</span>;
        }
        return rp;
      });
    });
  });
}

/* ─── Tips section types ─── */
type Tip = {
  id: string;
  category: EmissionCategory;
  action: string;
  monthlySavingKg: number;
  context: string;
};

const tipIconMap: Partial<Record<EmissionCategory, ReactNode>> = {
  transport: <TrainFront aria-hidden size={20} />,
  energy: <Zap aria-hidden size={20} />,
  diet: <Utensils aria-hidden size={20} />,
  shopping: <Lightbulb aria-hidden size={20} />,
  waste: <Recycle aria-hidden size={20} />,
  digital: <Lightbulb aria-hidden size={20} />,
};

/* ─── Main page ─── */
export default function AiAssistantPage() {
  const { profile } = useSettings();

  /* ─── Chat state ─── */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "coach",
      content: `Hi${profile.name ? ` ${profile.name.split(" ")[0]}` : ""}! I'm **EcoCoach** 🌿 — your AI sustainability advisor powered by Google Gemini.\n\nI can help you:\n- 📊 Calculate your carbon footprint\n- 💡 Find personalized ways to reduce emissions\n- 🇮🇳 Get India-specific eco tips\n- 🌍 Understand your environmental impact\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userFootprint, setUserFootprint] = useState(1900);

  /* ─── Tips state ─── */
  const [topCategory, setTopCategory] = useState<EmissionCategory>(demoDashboard.topCategory);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [tipMessage, setTipMessage] = useState("");
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem("user_footprint");
    if (stored) setUserFootprint(parseInt(stored, 10));

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((p) => { if (p.data?.topCategory) setTopCategory(p.data.topCategory); })
      .catch(() => setTopCategory(demoDashboard.topCategory));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  /* ─── Chat handler ─── */
  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].filter((m) => m.id !== "welcome").slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));
      if (history.length > 0 && history[0].role !== "user") history.shift();

      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userContext: { footprint: userFootprint, name: profile.name || "User", city: "India" },
        }),
      });
      const data = await response.json();
      if (data.error) {
        setMessages((prev) => [...prev, { id: `coach-${Date.now()}`, role: "coach", content: `⚠️ ${data.error}\n\nPlease make sure your **GEMINI_API_KEY** is set in the \`.env.local\` file.`, timestamp: new Date() }]);
      } else {
        setMessages((prev) => [...prev, { id: `coach-${Date.now()}`, role: "coach", content: data.text, timestamp: new Date() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: `coach-${Date.now()}`, role: "coach", content: "I'm having trouble connecting right now. Please try again! 🔄", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([{ id: "welcome", role: "coach", content: `Fresh start! 🌿 How can I help you with your carbon footprint today, ${profile.name?.split(" ")[0] || "friend"}?`, timestamp: new Date() }]);
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

  /* ─── Tips handler ─── */
  const completeTip = async (tip: Tip) => {
    if (loading[tip.id]) return;
    setLoading((c) => ({ ...c, [tip.id]: true }));
    try {
      const response = await fetch("/api/tips/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId: tip.id }),
      });
      const payload = await response.json();
      if (payload.error) {
        setTipMessage(`❌ ${payload.error}`);
      } else {
        setCompleted((c) => ({ ...c, [tip.id]: true }));
        setTipMessage(`Nice step. +${payload.data.coinsEarned} eco-coins added. 🌿`);
      }
    } catch {
      setTipMessage("❌ Failed to complete tip. Please try again.");
    } finally {
      setLoading((c) => ({ ...c, [tip.id]: false }));
    }
  };

  const tipSections: Array<{ title: string; description: string; tips: Tip[] }> = [
    { title: "Quick wins", description: "Actions that usually save under 0.5 kg/day.", tips: demoTips.quickWins },
    { title: "Big impact", description: "Actions that usually save over 1 kg/day.", tips: demoTips.bigImpact },
    { title: "India-specific", description: "Local context for Indian homes and city routines.", tips: demoTips.indiaSpecific },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-20 md:pb-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Bot size={24} />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">AI-Powered</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black">AI Sustainability Assistant</h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
            Chat with EcoCoach for personalized carbon advice, or browse curated eco tips.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4">
        <Tabs defaultValue="chat">
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="chat" className="gap-1.5">
                <Bot size={16} /> AI Coach
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-1.5">
                <Lightbulb size={16} /> Eco Tips
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: AI Coach Chat */}
          <TabsContent value="chat" className="mt-0">
            <div className="flex h-[calc(100vh-16rem)] flex-col md:flex-row rounded-3xl border border-[#52B788]/20 bg-white dark:bg-[#0f201b] overflow-hidden shadow-sm">
              {/* Sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#52B788]/15 dark:border-white/10 overflow-x-auto md:overflow-y-auto bg-[#F8FAF5] dark:bg-white/[0.02]">
                <div className="p-4">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-lg shadow-md">🌿</div>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#1B4332] dark:text-white">EcoCoach AI</h2>
                      <p className="text-[10px] font-medium text-[#6B7C6E] dark:text-white/70">Powered by Gemini</p>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 p-2.5 text-center">
                      <p className="text-lg font-extrabold text-[#2D6A4F] dark:text-[#52B788]">{userFootprint}</p>
                      <p className="text-[9px] font-bold uppercase text-[#6B7C6E] dark:text-white/60">kg CO₂/yr</p>
                    </div>
                    <div className="rounded-xl bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 p-2.5 text-center">
                      <p className="text-lg font-extrabold text-[#2D6A4F] dark:text-[#52B788]">{messageCount}</p>
                      <p className="text-[9px] font-bold uppercase text-[#6B7C6E] dark:text-white/60">Questions</p>
                    </div>
                  </div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60">Quick topics</p>
                  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible hide-scrollbar">
                    {QUICK_TOPICS.map((topic) => (
                      <button key={topic.label} onClick={() => handleSend(topic.prompt)} disabled={isTyping} className="group whitespace-nowrap flex items-center gap-2 rounded-xl border border-[#D1FAE5]/80 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-2.5 text-sm font-semibold hover:border-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/15 transition-all duration-200 disabled:opacity-40">
                        <span className="text-base">{topic.emoji}</span>
                        <span className="text-xs">{topic.label}</span>
                      </button>
                    ))}
                  </div>
                  {messageCount > 0 && (
                    <button onClick={handleClearChat} className="mt-4 w-full rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition">
                      🗑️ Clear conversation
                    </button>
                  )}
                </div>
              </div>

              {/* Chat area */}
              <div className="flex flex-1 flex-col relative">
                <div className="absolute top-0 inset-x-0 z-10 flex justify-center p-2 pointer-events-none">
                  <div className="flex items-center gap-2 rounded-full bg-white/90 dark:bg-[#1A2F2A]/90 px-4 py-2 text-xs font-semibold shadow-lg shadow-black/5 backdrop-blur-xl border border-[#D1FAE5]/50 dark:border-white/10">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini AI Active • Footprint: <span className="text-[#2D6A4F] dark:text-[#52B788]">{userFootprint} kg/yr</span>{userFootprint === 1900 && " (India avg)"}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pt-14">
                  <div className="max-w-3xl mx-auto space-y-5">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease]`}>
                        <div className={`flex max-w-[85%] items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          {msg.role === "coach" && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-sm shadow-md">🌿</div>
                          )}
                          <div className={`rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white rounded-br-sm shadow-md" : "bg-[#F8FAF5] dark:bg-[#1A2F2A] border border-[#D1FAE5]/60 dark:border-white/10 rounded-bl-sm shadow-sm"}`}>
                            {msg.role === "user" ? <p className="text-sm leading-relaxed">{msg.content}</p> : <div>{formatMessage(msg.content)}</div>}
                            <p className={`mt-1.5 text-[10px] ${msg.role === "user" ? "text-white/60" : "text-[#6B7C6E]/80 dark:text-white/50"}`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {msg.role === "user" && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] dark:bg-[#2D6A4F]/40 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                              {(profile.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start animate-[fadeIn_0.2s_ease]">
                        <div className="flex max-w-[85%] items-end gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-sm shadow-md">🌿</div>
                          <div className="rounded-2xl px-5 py-4 bg-[#F8FAF5] dark:bg-[#1A2F2A] border border-[#D1FAE5]/60 dark:border-white/10 rounded-bl-sm shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "300ms" }} />
                              <span className="ml-2 text-xs text-[#6B7C6E] dark:text-white/60">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isTyping && messages.length > 2 && messages[messages.length - 1]?.role === "coach" && (
                      <div className="flex flex-wrap gap-2 pl-10">
                        {FOLLOW_UP_SUGGESTIONS.map((s) => (
                          <button key={s} onClick={() => handleSend(s)} className="rounded-full border border-[#D1FAE5] dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/15 hover:border-[#52B788] transition-all duration-200">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-[#D1FAE5]/60 dark:border-white/10 bg-white/80 dark:bg-[#0B1815]/80 backdrop-blur-xl p-4">
                  <div className="max-w-3xl mx-auto flex items-center gap-2">
                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend(input)} placeholder="Ask EcoCoach anything about sustainability..." disabled={isTyping} className="w-full rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/10 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-5 py-3.5 pr-12 text-sm focus:border-[#2D6A4F] focus:outline-none disabled:opacity-50 transition" />
                    <button onClick={() => handleSend(input)} disabled={!input.trim() || isTyping} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl transition-all disabled:opacity-40 active:scale-95">
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-[#6B7C6E]/80 dark:text-white/50">Powered by Google Gemini • Responses are AI-generated</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Eco Tips */}
          <TabsContent value="tips">
            <section className="space-y-8 pb-8">
              {/* Hero */}
              <div className="relative rounded-3xl p-6 text-white shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D6A4F] to-[#1B4332]" />
                <div className="relative z-10">
                  <Badge className="bg-white/10 text-white/80">Highest category: {CATEGORY_LABELS[topCategory]}</Badge>
                  <h2 className="mt-4 text-2xl font-black">Tips & Actions</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Small changes first, bigger wins when they fit your routine.</p>
                </div>
              </div>

              {tipMessage && (
                <p role="status" aria-live="polite" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 dark:bg-[#52B788]/10 dark:text-[#52B788]">
                  {tipMessage}
                </p>
              )}

              <QuickWinsCarousel />

              {tipSections.map((section) => (
                <section className="space-y-3" key={section.title}>
                  <CardHeader className="mb-0 px-0">
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {section.tips.map((tip) => {
                      const isCompleted = Boolean(completed[tip.id]);
                      const preferred = tip.category === topCategory;
                      return (
                        <motion.div key={tip.id} animate={isCompleted && !prefersReduced ? { scale: [1, 1.02, 1] } : { scale: 1 }} transition={{ duration: prefersReduced ? 0 : 0.28 }}>
                          <Card className={preferred ? "border-emerald-300 bg-emerald-50/60 dark:border-[#52B788]/30 dark:bg-[#52B788]/5" : undefined}>
                            <div className="flex items-start gap-3">
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-[#52B788]/15 dark:text-[#52B788]">
                                {tipIconMap[tip.category]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge tone={preferred ? "dark" : "green"}>{CATEGORY_LABELS[tip.category]}</Badge>
                                  {preferred && <Badge tone="amber">Personalized</Badge>}
                                </div>
                                <h3 className="mt-3 text-lg font-extrabold text-gray-900 dark:text-white">{tip.action}</h3>
                                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-white/70">{tip.context}</p>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                  <p className="text-sm font-extrabold text-emerald-600 dark:text-[#52B788]">
                                    Saves {tip.monthlySavingKg.toFixed(1)} kgCO2e/month
                                  </p>
                                  <Button disabled={isCompleted} onClick={() => completeTip(tip)} type="button" variant={isCompleted ? "secondary" : "default"}>
                                    {isCompleted ? <CheckCircle2 aria-hidden size={18} /> : <Coins aria-hidden size={18} />}
                                    {isCompleted ? "Done" : "Mark as done"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
