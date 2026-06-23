"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export function NewDiscussionModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Transport");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just close the modal
    onClose();
  };

  const categories = ["Transport", "Energy", "Diet", "Shopping", "Waste", "General"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="New Discussion"
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f201b] shadow-2xl border border-[#52B788]/20 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#52B788]/10">
          <h2 className="text-xl font-black text-[#2D6A4F] dark:text-[#52B788]">Start a Discussion</h2>
          <button ref={closeRef} onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    category === cat
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-xl border border-[#52B788]/20 bg-[#F8FAF5] dark:bg-black/20 px-4 py-3 text-sm focus:outline-none focus:border-[#52B788] dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts, questions, or tips..."
              rows={5}
              className="w-full rounded-xl border border-[#52B788]/20 bg-[#F8FAF5] dark:bg-black/20 px-4 py-3 text-sm focus:outline-none focus:border-[#52B788] resize-none dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 font-bold hover:bg-[#1B4332] transition"
          >
            Post Discussion
          </button>
        </form>
      </div>
    </div>
  );
}
