"use client";

import { useState, useRef, useEffect } from "react";
import { callClaude } from "@/lib/anthropicClient";
import { Send, Mic } from "lucide-react";

const SYSTEM_PROMPT = `
You are EcoCoach, a friendly and knowledgeable carbon footprint advisor built into a sustainability platform.

Your role:
- Help users understand their personal carbon footprint across: transport, food, home energy, shopping, and waste.
- Give specific, actionable, quantified advice (always mention kg CO2e savings where relevant).
- Reference real emission factors: car travel emits ~192g CO2/km, beef ~27kg CO2 per kg, flights ~255g CO2/km short-haul.
- The global average footprint is 4 tonnes CO2e/year. The Paris Agreement target is 2.3 tonnes by 2030.
- For Indian users: average footprint is ~1.9 tonnes. Electricity grid factor is ~0.82 kg CO2/kWh (coal-heavy grid).
- Suggest offset projects only when user has already reduced what they can.
- Keep responses concise (3–5 sentences), warm, and never preachy.
- When asked for a plan, give a numbered list with estimated kg CO2 savings per action.
- If asked about a product or food, estimate its carbon cost from lifecycle data.
- Always end with one follow-up question to keep the conversation going.
`;

const QUICK_TOPICS = [
  "My commute",
  "My diet",
  "Home energy",
  "Shopping habits",
  "My travel",
  "How to offset",
];

interface Message {
  role: "user" | "coach";
  content: string;
}

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "coach", content: "Hi! I'm EcoCoach 🌿. How can I help you reduce your carbon footprint today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [userFootprint, setUserFootprint] = useState(1900);

  useEffect(() => {
    // Attempt to load user footprint from local storage
    const stored = localStorage.getItem("user_footprint");
    if (stored) {
      setUserFootprint(parseInt(stored, 10));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const coachMsgIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "coach", content: "" }]);

    try {
      await callClaude(SYSTEM_PROMPT, text, (chunk) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[coachMsgIndex] = {
            ...newMessages[coachMsgIndex],
            content: newMessages[coachMsgIndex].content + chunk,
          };
          return newMessages;
        });
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[coachMsgIndex] = {
          role: "coach",
          content: "Oops, I'm having trouble connecting right now. Please try again later!",
        };
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to extract potential CO2 savings to display a badge
  const renderMessageContent = (msg: Message) => {
    if (msg.role === "user") {
      return <span>{msg.content}</span>;
    }

    // Very naive badge extraction (matches "saves ~X kg CO2")
    const savingsMatch = msg.content.match(/saves?\s~?(\d+)\s*kg\s*co2/i);
    
    return (
      <div className="flex flex-col gap-2">
        <span className="whitespace-pre-wrap">{msg.content}</span>
        {savingsMatch && (
          <span className="inline-block self-start rounded-full bg-[#52B788]/20 px-2 py-1 text-xs font-semibold text-[#1B4332] dark:bg-[#52B788]/30 dark:text-[#F8FAF5]">
            Saves ~{savingsMatch[1]} kg CO2/yr
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5]">
      {/* Sidebar - Quick Topics */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#2D6A4F]/20 p-4 overflow-x-auto md:overflow-y-auto">
        <h2 className="mb-4 text-lg font-bold text-[#2D6A4F] dark:text-[#52B788]">Quick Topics</h2>
        <div className="flex md:flex-col gap-2">
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => handleSend(topic)}
              disabled={isTyping}
              className="whitespace-nowrap rounded-full border border-[#52B788] bg-transparent px-4 py-2 text-sm font-medium hover:bg-[#52B788]/10 transition disabled:opacity-50"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Context Card */}
        <div className="absolute top-0 inset-x-0 z-10 flex justify-center p-2 pointer-events-none">
          <div className="rounded-full bg-white/90 dark:bg-black/90 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur">
            Your footprint context: <span className="text-[#2D6A4F] dark:text-[#52B788]">{userFootprint} kg/yr</span>
            {userFootprint === 1900 && " (India avg)"}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 pt-16">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "coach" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white">
                      🌿
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[#2D6A4F] text-white rounded-br-none"
                        : "bg-white dark:bg-[#1A2F2A] border border-[#52B788]/20 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] items-end gap-2 flex-row">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white">
                    🌿
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-white dark:bg-[#1A2F2A] border border-[#52B788]/20 rounded-bl-none shadow-sm">
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-[#52B788] rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-[#52B788] rounded-full animate-pulse delay-75"></span>
                      <span className="w-2 h-2 bg-[#52B788] rounded-full animate-pulse delay-150"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2D6A4F]/20 bg-white dark:bg-[#0B1815] p-4">
          <div className="max-w-3xl mx-auto relative flex items-center gap-2">
            <button className="p-2 text-neutral-500 hover:text-[#2D6A4F] transition" title="Voice input (UI only)">
              <Mic size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask EcoCoach..."
              disabled={isTyping}
              className="flex-1 rounded-full border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-3 text-sm focus:border-[#2D6A4F] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
