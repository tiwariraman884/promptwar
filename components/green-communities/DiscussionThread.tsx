"use client";

import { MessageCircle, Clock } from "lucide-react";

export interface ThreadData {
  id: string;
  title: string;
  author: string;
  authorInitials: string;
  replies: number;
  timeAgo: string;
  category: string;
  preview: string;
}

const DEMO_THREADS: ThreadData[] = [
  {
    id: "t1",
    title: "Best EV charging stations in Delhi NCR?",
    author: "Aarav S.",
    authorInitials: "AS",
    replies: 24,
    timeAgo: "2 hours ago",
    category: "Transport",
    preview: "Looking for reliable EV charging stations near Connaught Place and Noida. Any recommendations?",
  },
  {
    id: "t2",
    title: "Composting in apartments — my 6-month journey",
    author: "Priya M.",
    authorInitials: "PM",
    replies: 18,
    timeAgo: "5 hours ago",
    category: "Waste",
    preview: "Started composting in my 2BHK flat 6 months ago. Here's what worked and what didn't...",
  },
  {
    id: "t3",
    title: "Solar panel ROI in Maharashtra — real numbers",
    author: "Rohan G.",
    authorInitials: "RG",
    replies: 31,
    timeAgo: "1 day ago",
    category: "Energy",
    preview: "Installed a 3kW rooftop solar system last year. Sharing my actual savings and payback period.",
  },
  {
    id: "t4",
    title: "Weekly meal plan to reduce food carbon footprint",
    author: "Kavya D.",
    authorInitials: "KD",
    replies: 12,
    timeAgo: "2 days ago",
    category: "Diet",
    preview: "Created a balanced Indian meal plan that cuts food emissions by 40%. Mostly plant-based with some dairy.",
  },
  {
    id: "t5",
    title: "Sustainable fashion brands in India — curated list",
    author: "Zara K.",
    authorInitials: "ZK",
    replies: 45,
    timeAgo: "3 days ago",
    category: "Shopping",
    preview: "Compiled a list of 20+ Indian brands that are genuinely sustainable, not just greenwashing.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Transport: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Waste: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Energy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Diet: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Shopping: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export function DiscussionThread({ onNewThread }: { onNewThread: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#2D6A4F] dark:text-[#52B788]">Community Discussions</h3>
          <p className="text-sm text-neutral-500 mt-1">Share tips, ask questions, and learn from fellow eco-warriors.</p>
        </div>
        <button
          onClick={onNewThread}
          className="rounded-xl bg-[#2D6A4F] text-white px-5 py-2.5 font-bold hover:bg-[#1B4332] transition"
        >
          + New Discussion
        </button>
      </div>

      <div className="space-y-3">
        {DEMO_THREADS.map((thread) => (
          <button
            key={thread.id}
            className="w-full text-left rounded-2xl bg-white dark:bg-[#1A2F2A] p-5 shadow-sm border border-[#52B788]/10 hover:border-[#52B788]/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#52B788]/20 font-bold text-sm text-[#2D6A4F] dark:text-[#52B788]">
                {thread.authorInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[thread.category] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {thread.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock size={12} />
                    {thread.timeAgo}
                  </span>
                </div>
                <h4 className="font-bold text-[#1B4332] dark:text-white group-hover:text-[#2D6A4F] dark:group-hover:text-[#52B788] transition truncate">
                  {thread.title}
                </h4>
                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{thread.preview}</p>
                <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {thread.replies} replies
                  </span>
                  <span>by {thread.author}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
