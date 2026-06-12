"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "@/lib/settings-context";
import { Send } from "lucide-react";

/* ─── Types ─── */
interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: Date;
}

/* ─── Quick topic chips ─── */
const QUICK_TOPICS = [
  { label: "My commute", emoji: "🚗", prompt: "Analyze my daily commute carbon footprint and suggest greener alternatives for Indian cities" },
  { label: "My diet", emoji: "🍽️", prompt: "How does a typical Indian vegetarian vs non-vegetarian diet compare in carbon footprint?" },
  { label: "Home energy", emoji: "⚡", prompt: "How can I reduce my home electricity carbon footprint in India?" },
  { label: "Shopping habits", emoji: "🛍️", prompt: "What's the carbon impact of fast fashion vs sustainable clothing in India?" },
  { label: "Air travel", emoji: "✈️", prompt: "How much CO2 does a Delhi to Mumbai flight produce and how can I offset it?" },
  { label: "How to offset", emoji: "🌳", prompt: "What are the best carbon offset options available in India?" },
  { label: "Water usage", emoji: "💧", prompt: "How does my daily water consumption contribute to carbon emissions?" },
  { label: "EV switch", emoji: "🔋", prompt: "Should I switch to an electric vehicle in India? What's the carbon math?" },
  { label: "Zero waste", emoji: "♻️", prompt: "Give me a practical zero-waste plan for an Indian household" },
  { label: "Green cooking", emoji: "🍳", prompt: "Compare LPG vs induction vs solar cooking carbon footprint for Indian kitchens" },
];

/* ─── Suggested follow-ups ─── */
const FOLLOW_UP_SUGGESTIONS = [
  "How much CO₂ does that save per year?",
  "Give me a step-by-step plan",
  "What about the cost savings?",
  "Compare with alternatives",
];

/* ─── Markdown-like formatting ─── */
function formatMessage(text: string) {
  // Split into paragraphs
  const paragraphs = text.split("\n\n");
  return paragraphs.map((para, pIdx) => {
    // Check for numbered lists
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

    // Check for bullet points
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
  // Bold: **text** or __text__
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-[#1B4332] dark:text-[#B7E4C7]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return <strong key={i} className="font-bold text-[#1B4332] dark:text-[#B7E4C7]">{part.slice(2, -2)}</strong>;
    }
    // Highlight kg CO2 mentions
    const co2Parts = part.split(/(~?\d+[\.,]?\d*\s*(?:kg|tonnes?|t)\s*CO₂?e?(?:\/(?:yr|year|month|day|km|person))?)/gi);
    return co2Parts.map((cp, j) => {
      if (/\d+.*(?:kg|tonnes?|t)\s*CO/i.test(cp)) {
        return (
          <span key={`${i}-${j}`} className="inline-flex items-center gap-1 rounded-md bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-1.5 py-0.5 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mx-0.5">
            🌿 {cp.trim()}
          </span>
        );
      }
      // Highlight ₹ amounts
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

/* ─── Main page ─── */
export default function AiCoachPage() {
  const { profile } = useSettings();
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
  const [showTopics, setShowTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userFootprint, setUserFootprint] = useState(1900);

  useEffect(() => {
    const stored = localStorage.getItem("user_footprint");
    if (stored) setUserFootprint(parseInt(stored, 10));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowTopics(false);

    try {
      // Build conversation history (last 10 messages for context)
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          content: m.content,
        }));

      // Ensure conversation starts with user message for Gemini
      if (history.length > 0 && history[0].role !== "user") {
        history.shift();
      }

      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userContext: {
            footprint: userFootprint,
            name: profile.name || "User",
            city: "India",
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `coach-${Date.now()}`,
            role: "coach",
            content: `⚠️ ${data.error}\n\nPlease make sure your **GEMINI_API_KEY** is set in the \`.env.local\` file. You can get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `coach-${Date.now()}`,
            role: "coach",
            content: data.text,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("AI Coach error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-${Date.now()}`,
          role: "coach",
          content: "I'm having trouble connecting right now. Please check your internet connection and try again! 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "coach",
        content: `Fresh start! 🌿 How can I help you with your carbon footprint today, ${profile.name?.split(" ")[0] || "friend"}?`,
        timestamp: new Date(),
      },
    ]);
    setShowTopics(true);
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-20 md:pb-0">
      {/* ─── Sidebar ─── */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#2D6A4F]/15 dark:border-white/10 overflow-x-auto md:overflow-y-auto bg-white/50 dark:bg-white/[0.02]">
        <div className="p-4">
          {/* AI badge */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-lg shadow-md">
              🌿
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1B4332] dark:text-white">EcoCoach AI</h2>
              <p className="text-[10px] font-medium text-[#6B7C6E] dark:text-white/50">Powered by Gemini</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 p-2.5 text-center">
              <p className="text-lg font-extrabold text-[#2D6A4F] dark:text-[#52B788]">{userFootprint}</p>
              <p className="text-[9px] font-bold uppercase text-[#6B7C6E] dark:text-white/40">kg CO₂/yr</p>
            </div>
            <div className="rounded-xl bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 p-2.5 text-center">
              <p className="text-lg font-extrabold text-[#2D6A4F] dark:text-[#52B788]">{messageCount}</p>
              <p className="text-[9px] font-bold uppercase text-[#6B7C6E] dark:text-white/40">Questions</p>
            </div>
          </div>

          {/* Quick topics */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/40">Quick topics</p>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible hide-scrollbar">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                onClick={() => handleSend(topic.prompt)}
                disabled={isTyping}
                className="group whitespace-nowrap flex items-center gap-2 rounded-xl border border-[#D1FAE5]/80 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-2.5 text-sm font-semibold hover:border-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/15 transition-all duration-200 disabled:opacity-40"
              >
                <span className="text-base">{topic.emoji}</span>
                <span className="text-xs">{topic.label}</span>
              </button>
            ))}
          </div>

          {/* Clear chat */}
          {messageCount > 0 && (
            <button
              onClick={handleClearChat}
              className="mt-4 w-full rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
            >
              🗑️ Clear conversation
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Chat Area ─── */}
      <div className="flex flex-1 flex-col relative">
        {/* Context banner */}
        <div className="absolute top-0 inset-x-0 z-10 flex justify-center p-2 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-white/90 dark:bg-[#1A2F2A]/90 px-4 py-2 text-xs font-semibold shadow-lg shadow-black/5 backdrop-blur-xl border border-[#D1FAE5]/50 dark:border-white/10">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Gemini AI Active • Footprint: <span className="text-[#2D6A4F] dark:text-[#52B788]">{userFootprint} kg/yr</span>
              {userFootprint === 1900 && " (India avg)"}
            </span>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-4 pt-14">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease]`}
              >
                <div className={`flex max-w-[85%] items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "coach" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-sm shadow-md">
                      🌿
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white rounded-br-sm shadow-md"
                        : "bg-white dark:bg-[#1A2F2A] border border-[#D1FAE5]/60 dark:border-white/10 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div>{formatMessage(msg.content)}</div>
                    )}
                    <p className={`mt-1.5 text-[10px] ${msg.role === "user" ? "text-white/40" : "text-[#6B7C6E]/60 dark:text-white/25"}`}>
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

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-[fadeIn_0.2s_ease]">
                <div className="flex max-w-[85%] items-end gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-sm shadow-md">
                    🌿
                  </div>
                  <div className="rounded-2xl px-5 py-4 bg-white dark:bg-[#1A2F2A] border border-[#D1FAE5]/60 dark:border-white/10 rounded-bl-sm shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="ml-2 text-xs text-[#6B7C6E] dark:text-white/40">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up suggestions */}
            {!isTyping && messages.length > 2 && messages[messages.length - 1]?.role === "coach" && (
              <div className="flex flex-wrap gap-2 pl-10">
                {FOLLOW_UP_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-[#D1FAE5] dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/15 hover:border-[#52B788] transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Input area ─── */}
        <div className="border-t border-[#D1FAE5]/60 dark:border-white/10 bg-white/80 dark:bg-[#0B1815]/80 backdrop-blur-xl p-4 pb-6 md:pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask EcoCoach anything about sustainability..."
                  disabled={isTyping}
                  className="w-full rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/10 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-5 py-3.5 pr-12 text-sm focus:border-[#2D6A4F] focus:outline-none disabled:opacity-50 transition placeholder:text-[#6B7C6E]/50"
                />
              </div>
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl hover:shadow-[#2D6A4F]/30 transition-all duration-200 disabled:opacity-40 disabled:shadow-none active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#6B7C6E]/60 dark:text-white/25">
              Powered by Google Gemini • Responses are AI-generated and may not be 100% accurate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
