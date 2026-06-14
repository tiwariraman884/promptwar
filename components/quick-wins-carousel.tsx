"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CATEGORY_META,
  QUICK_WINS_DATA,
  type QuickWinCategory,
  type QuickWinTip,
} from "@/lib/quick-wins-data";

/* ─────────────────────── TYPES ─────────────────────── */

type FilterKey = "all" | QuickWinCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "small-habit", label: "Small Habit" },
  { key: "big-impact", label: "Big Impact" },
  { key: "india-specific", label: "India-Specific" },
];

/* ─────────────────── HELPER: useReducedMotion ─────────────────── */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ─────────────────── DETAIL MODAL ─────────────────── */

function DetailModal({
  tip,
  onClose,
  titleId,
  reducedMotion,
}: {
  tip: QuickWinTip;
  onClose: () => void;
  titleId: string;
  reducedMotion: boolean;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Focus trap + keyboard handling */
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Focus the close button on open
    closeRef.current?.focus();

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const meta = CATEGORY_META[tip.category];
  const transitionClass = reducedMotion
    ? ""
    : "animate-[modalIn_280ms_cubic-bezier(0.16,1,0.3,1)_forwards]";

  return (
    /* Backdrop — clicking it closes modal */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      {/* Dim + blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-[#52B788]/20 dark:border-white/10 bg-white dark:bg-[#0f201b] shadow-2xl ${transitionClass}`}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line/50 dark:border-white/[0.06] bg-white/95 dark:bg-[#0f201b]/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0" aria-hidden="true">{tip.icon}</span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-extrabold text-ink dark:text-white truncate font-heading">
                {tip.title}
              </h2>
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.bgLight}`}>
                {meta.label}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close detail panel"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-6 space-y-6">
          {/* Carbon savings — prominent */}
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/5 border border-emerald-200/60 dark:border-emerald-700/20 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800/70 dark:text-emerald-300/70" aria-hidden="true">
                Estimated Monthly Savings
              </p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                {tip.monthlySavings.toFixed(1)}
                <span className="ml-1.5 text-base font-bold">kgCO₂e</span>
              </p>
              <span className="sr-only">
                Estimated monthly carbon savings: {tip.monthlySavings.toFixed(1)} kilograms of CO2 equivalent
              </span>
            </div>
          </div>

          {/* Why It Matters */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-ink/60 dark:text-white/50 mb-2 font-heading">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#2D6A4F]/10 dark:bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788] text-xs">💡</span>
              Why It Matters
            </h3>
            <p className="text-[15px] leading-relaxed text-ink/80 dark:text-white/75">
              {tip.whyItMatters}
            </p>
          </section>

          {/* How To Do It */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-ink/60 dark:text-white/50 mb-2 font-heading">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#2D6A4F]/10 dark:bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788] text-xs">📋</span>
              How To Do It
            </h3>
            <ul className="space-y-2">
              {tip.howTo.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-ink/80 dark:text-white/75">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-[11px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>

          {/* Indian Context */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-ink/60 dark:text-white/50 mb-2 font-heading">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#2D6A4F]/10 dark:bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788] text-xs">🇮🇳</span>
              Indian Context
            </h3>
            <p className="text-[15px] leading-relaxed text-ink/80 dark:text-white/75">
              {tip.indiaContext}
            </p>
          </section>

          {/* Source + Learn More */}
          <div className="rounded-2xl border border-line/60 dark:border-white/[0.06] bg-mist dark:bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-white/40 mb-2">
              Source / Scheme
            </p>
            <p className="text-sm font-bold text-ink dark:text-white mb-3">{tip.sourceName}</p>
            <a
              href={tip.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-5 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f201b]"
            >
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── TIP CARD ─────────────────── */

function TipCard({
  tip,
  onClick,
  reducedMotion,
}: {
  tip: QuickWinTip;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const meta = CATEGORY_META[tip.category];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${tip.title}. Saves ${tip.monthlySavings} kilograms CO2 equivalent per month. Click for details.`}
      className={`group relative flex h-full w-full flex-col text-left rounded-2xl border border-line/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-5 shadow-[0_2px_12px_rgba(8,80,65,0.06)] dark:shadow-none cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1815] ${
        reducedMotion
          ? ""
          : "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(8,80,65,0.12)] hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_2px_8px_rgba(8,80,65,0.08)]"
      }`}
    >
      {/* Top row: emoji + category badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-3xl leading-none" aria-hidden="true">{tip.icon}</span>
        <span className="sr-only">{tip.iconLabel}</span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.bgLight}`}>
          {meta.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-extrabold text-ink dark:text-white leading-snug mb-1.5 font-heading">
        {tip.title}
      </h3>

      {/* Description — 2 line clamp */}
      <p className="text-sm leading-relaxed text-ink/65 dark:text-white/60 line-clamp-2 flex-1">
        {tip.shortDescription}
      </p>

      {/* Bottom: carbon savings */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-line/50 dark:border-white/[0.06]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </span>
        <span className="sr-only">Estimated monthly carbon savings</span>
        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {tip.monthlySavings.toFixed(1)} kgCO₂e
        </span>
        <span className="text-xs text-ink/40 dark:text-white/40 font-medium">/ month</span>

        {/* Subtle "expand" hint */}
        <svg
          className={`ml-auto text-ink/25 dark:text-white/25 shrink-0 ${reducedMotion ? "" : "transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink/50 dark:group-hover:text-white/50"}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}

/* ─────────────────── PROGRESS DOTS ─────────────────── */

function ProgressDots({
  count,
  activeIndex,
  onDotClick,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-5" role="tablist" aria-label="Carousel page indicators">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Go to page ${i + 1}`}
          onClick={() => onDotClick(i)}
          className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] ${
            i === activeIndex
              ? "w-6 bg-[#2D6A4F] dark:bg-[#52B788]"
              : "w-2 bg-line dark:bg-white/20 hover:bg-[#52B788]/50"
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────────── MAIN CAROUSEL COMPONENT ─────────────────── */

export function QuickWinsCarousel() {
  const instanceId = useId();
  const reducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedTip, setSelectedTip] = useState<QuickWinTip | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  /* Filter tips */
  const filteredTips = useMemo(
    () =>
      activeFilter === "all"
        ? QUICK_WINS_DATA
        : QUICK_WINS_DATA.filter((t) => t.category === activeFilter),
    [activeFilter]
  );

  /* Count per filter */
  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = {
      all: QUICK_WINS_DATA.length,
      "small-habit": 0,
      "big-impact": 0,
      "india-specific": 0,
    };
    QUICK_WINS_DATA.forEach((t) => map[t.category]++);
    return map;
  }, []);

  /* ── Announce filter changes to screen readers ── */
  const announceFilter = useCallback((filterLabel: string, count: number) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Showing ${count} ${filterLabel} tips`;
    }
  }, []);

  /* ── Handle filter change ── */
  const changeFilter = useCallback(
    (key: FilterKey) => {
      setActiveFilter(key);
      setActiveCardIndex(0);
      // Scroll carousel to start
      scrollRef.current?.scrollTo({ left: 0, behavior: reducedMotion ? "auto" : "smooth" });
      const filter = FILTERS.find((f) => f.key === key);
      announceFilter(filter?.label ?? "All", counts[key]);
    },
    [reducedMotion, announceFilter, counts]
  );

  /* ── Keyboard nav for filter tabs ── */
  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % FILTERS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + FILTERS.length) % FILTERS.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = FILTERS.length - 1;
      } else {
        return;
      }
      const btn = document.getElementById(`${instanceId}-filter-${nextIndex}`);
      btn?.focus();
      changeFilter(FILTERS[nextIndex].key);
    },
    [changeFilter, instanceId]
  );

  /* ── Observe scroll position to update active dot ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = () => {
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth +
          parseFloat(getComputedStyle(el).gap || "0")
        : 300;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveCardIndex(Math.max(0, Math.min(idx, filteredTips.length - 1)));
    };

    el.addEventListener("scroll", observer, { passive: true });
    return () => el.removeEventListener("scroll", observer);
  }, [filteredTips.length]);

  /* ── Carousel nav arrows ── */
  const scrollByCards = useCallback(
    (direction: 1 | -1) => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth +
          parseFloat(getComputedStyle(el).gap || "0")
        : 300;
      el.scrollBy({ left: direction * cardWidth, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion]
  );

  const scrollToCard = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || !el.children[index]) return;
      (el.children[index] as HTMLElement).scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        inline: "start",
        block: "nearest",
      });
    },
    [reducedMotion]
  );

  /* ── Keyboard nav for the carousel itself ── */
  const handleCarouselKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByCards(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByCards(-1);
      }
    },
    [scrollByCards]
  );

  /* ── Open/close detail modal ── */
  const openDetail = useCallback((tip: QuickWinTip, el: HTMLElement) => {
    setSelectedTip(tip);
    setTriggerEl(el);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedTip(null);
    // Return focus to the card that triggered the modal
    triggerEl?.focus();
    setTriggerEl(null);
  }, [triggerEl]);

  /* Modal title ID for aria-labelledby */
  const modalTitleId = `${instanceId}-modal-title`;

  const isAtStart = activeCardIndex === 0;
  const isAtEnd = activeCardIndex >= filteredTips.length - 1;

  return (
    <section
      aria-labelledby={`${instanceId}-heading`}
      className="relative"
    >
      {/* ── Live region for screen readers ── */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* ── Section Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-white text-lg shadow-lg shadow-[#2D6A4F]/20">
            🌿
          </span>
          <h2
            id={`${instanceId}-heading`}
            className="font-heading text-2xl font-extrabold text-ink dark:text-white sm:text-3xl"
          >
            Quick Wins for Lower Carbon Emissions
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink/65 dark:text-white/60 sm:text-base">
          Small lifestyle changes can add up to significant climate impact over time.
          Explore practical actions, estimated CO₂e savings, and learn how each action helps.
        </p>
      </div>

      {/* ── Category Filters ── */}
      <div
        role="tablist"
        aria-label="Filter tips by category"
        className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-5 -mx-1 px-1"
      >
        {FILTERS.map((filter, i) => {
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              id={`${instanceId}-filter-${i}`}
              role="tab"
              aria-selected={active}
              aria-controls={`${instanceId}-carousel`}
              tabIndex={active ? 0 : -1}
              onClick={() => changeFilter(filter.key)}
              onKeyDown={(e) => handleFilterKeyDown(e, i)}
              className={`relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] ${
                active
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "bg-white dark:bg-white/[0.05] text-ink/60 dark:text-white/50 border border-line/80 dark:border-white/[0.08] hover:bg-mist dark:hover:bg-white/[0.08] hover:text-ink dark:hover:text-white"
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 text-xs font-bold ${active ? "text-white/70" : "text-ink/35 dark:text-white/30"}`}>
                ({counts[filter.key]})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Carousel ── */}
      {filteredTips.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🍃</span>
          <p className="text-lg font-bold text-ink/70 dark:text-white/60 mb-1">No tips in this category</p>
          <p className="text-sm text-ink/50 dark:text-white/40">
            Try selecting a different filter above.
          </p>
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Nav arrows — desktop only */}
          {!isAtStart && (
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Previous tips"
              className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#1A2F2A] border border-line/80 dark:border-white/10 shadow-lg text-ink/70 dark:text-white/70 hover:bg-mist dark:hover:bg-[#2D6A4F]/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] ${
                reducedMotion ? "" : "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
              } hidden sm:flex`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          )}
          {!isAtEnd && (
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Next tips"
              className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#1A2F2A] border border-line/80 dark:border-white/10 shadow-lg text-ink/70 dark:text-white/70 hover:bg-mist dark:hover:bg-[#2D6A4F]/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] ${
                reducedMotion ? "" : "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
              } hidden sm:flex`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            id={`${instanceId}-carousel`}
            role="tabpanel"
            aria-label="Quick wins tips carousel"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-1 hide-scrollbar pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] rounded-2xl"
          >
            {filteredTips.map((tip) => (
              <div
                key={tip.id}
                className="snap-start shrink-0 w-[calc(85vw-2rem)] sm:w-[calc(50vw-3rem)] md:w-[calc(33.33vw-2rem)] lg:w-[calc(25vw-2rem)] max-w-[320px]"
              >
                <TipCard
                  tip={tip}
                  onClick={function (this: void) {
                    // We pass `this` context for element reference
                    const el = document.activeElement as HTMLElement;
                    openDetail(tip, el);
                  }}
                  reducedMotion={reducedMotion}
                />
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <ProgressDots
            count={filteredTips.length}
            activeIndex={activeCardIndex}
            onDotClick={(i) => scrollToCard(i)}
          />
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p className="mt-8 text-xs leading-relaxed text-ink/45 dark:text-white/35 max-w-3xl">
        <strong className="font-bold text-ink/55 dark:text-white/45">Disclaimer:</strong>{" "}
        CO₂e savings values are estimates intended for awareness and education. Actual reductions
        vary based on location, lifestyle, energy source, travel patterns, and household usage.
        Users should verify current government schemes and eligibility requirements through official sources.
      </p>

      {/* ── Detail Modal ── */}
      {selectedTip && (
        <DetailModal
          tip={selectedTip}
          onClose={closeDetail}
          titleId={modalTitleId}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}
