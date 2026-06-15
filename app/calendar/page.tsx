"use client";

import { useState, useMemo } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GREEN_EVENTS, getUpcomingEvents, getEventsForMonth, EVENT_CATEGORIES, type GreenEvent } from "@/lib/calendar-data";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<GreenEvent | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const upcoming = useMemo(() => getUpcomingEvents(6), []);
  const monthEvents = useMemo(() => {
    const events = getEventsForMonth(viewMonth + 1);
    if (filterCat === "all") return events;
    return events.filter(e => e.category === filterCat);
  }, [viewMonth, filterCat]);

  /* Calendar grid helpers */
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDayOfMonth + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const getEventsForDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `${monthStr}-${dayStr}`;
    return GREEN_EVENTS.filter(e => e.date === dateStr);
  };

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center py-4">
            <span className="text-4xl mb-3 block">📅</span>
            <h1 className="font-heading text-3xl font-extrabold mb-2">Green Calendar</h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              {GREEN_EVENTS.length} eco events throughout the year. Join challenges, earn bonus coins, and never miss a green moment!
            </p>
          </div>
        </Card>

        {/* Upcoming Events Strip */}
        <Card>
          <CardHeader>
            <CardTitle>🔜 Coming Up Next</CardTitle>
            <CardDescription>Nearest green events with bonus rewards</CardDescription>
          </CardHeader>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {upcoming.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="shrink-0 w-44 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 p-3 text-left hover:border-primary transition"
              >
                <span className="text-2xl block mb-2">{ev.emoji}</span>
                <p className="font-bold text-sm line-clamp-2 leading-tight">{ev.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge tone={ev.daysUntil <= 7 ? "amber" : "muted"} className="text-[10px]">
                    {ev.daysUntil === 0 ? "Today!" : ev.daysUntil === 1 ? "Tomorrow" : `In ${ev.daysUntil} days`}
                  </Badge>
                  <span className="text-[10px] font-bold text-primary">🪙 +{ev.coinsBonus}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* View toggle + filter */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl border border-line dark:border-white/10 p-1">
            <button
              onClick={() => setView("calendar")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${view === "calendar" ? "bg-primary text-white" : ""}`}
            >
              📆 Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${view === "list" ? "bg-primary text-white" : ""}`}
            >
              📋 List
            </button>
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-bold"
          >
            {EVENT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        {/* ── Calendar View ── */}
        {view === "calendar" && (
          <Card>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigateMonth(-1)} className="h-10 w-10 rounded-xl border border-line dark:border-white/10 flex items-center justify-center font-bold hover:bg-primary/10 transition">
                ←
              </button>
              <h2 className="font-heading text-xl font-extrabold">{MONTHS[viewMonth]} {viewYear}</h2>
              <button onClick={() => navigateMonth(1)} className="h-10 w-10 rounded-xl border border-line dark:border-white/10 flex items-center justify-center font-bold hover:bg-primary/10 transition">
                →
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-ink/40 dark:text-white/60 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} />;
                const dayEvents = getEventsForDay(day);
                const hasEvent = dayEvents.length > 0;
                return (
                  <button
                    key={i}
                    onClick={() => hasEvent && setSelectedEvent(dayEvents[0])}
                    className={`relative h-12 rounded-xl text-sm font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                      isToday(day) ? "bg-primary text-white ring-2 ring-primary/30" :
                      hasEvent ? "bg-primary/10 hover:bg-primary/20 text-primary-dark dark:text-primary" :
                      "hover:bg-line/30 dark:hover:bg-white/5"
                    }`}
                  >
                    {day}
                    {hasEvent && (
                      <div className="flex gap-0.5">
                        {dayEvents.slice(0, 2).map(e => (
                          <span key={e.id} className="text-[8px]">{e.emoji}</span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Events this month */}
            {monthEvents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide">Events in {MONTHS[viewMonth]}</p>
                {monthEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full flex items-center gap-3 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 p-3 text-left hover:border-primary transition"
                  >
                    <span className="text-2xl shrink-0">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm line-clamp-1">{ev.name}</p>
                      <p className="text-xs text-ink/50 dark:text-white/50">{ev.date.replace("-", "/")}</p>
                    </div>
                    <Badge tone="green" className="shrink-0 text-[10px]">🪙 +{ev.coinsBonus}</Badge>
                  </button>
                ))}
              </div>
            )}
            {monthEvents.length === 0 && (
              <p className="mt-4 text-center text-sm text-ink/40 dark:text-white/60 py-4">No events this month{filterCat !== "all" ? " in this category" : ""}.</p>
            )}
          </Card>
        )}

        {/* ── List View ── */}
        {view === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>All Green Events ({filterCat === "all" ? GREEN_EVENTS.length : GREEN_EVENTS.filter(e => e.category === filterCat).length})</CardTitle>
            </CardHeader>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {(filterCat === "all" ? GREEN_EVENTS : GREEN_EVENTS.filter(e => e.category === filterCat))
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full flex items-center gap-3 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 p-3 text-left hover:border-primary transition"
                  >
                    <span className="text-2xl shrink-0">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm line-clamp-1">{ev.name}</p>
                      <p className="text-xs text-ink/50 dark:text-white/50">
                        {MONTHS[parseInt(ev.date.split("-")[0]) - 1]} {ev.date.split("-")[1]}
                        {ev.endDate && ` – ${MONTHS[parseInt(ev.endDate.split("-")[0]) - 1]} ${ev.endDate.split("-")[1]}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone="muted" className="text-[10px]">{ev.category}</Badge>
                      <p className="text-[10px] font-bold text-primary mt-1">🪙 +{ev.coinsBonus}</p>
                    </div>
                  </button>
                ))}
            </div>
          </Card>
        )}

        {/* ── Event Detail Modal ── */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedEvent(null)}>
            <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-2xl space-y-4 animate-[modalIn_300ms_ease-out_forwards]">
              <div className="text-center">
                <span className="text-5xl block mb-3">{selectedEvent.emoji}</span>
                <h2 className="font-heading text-2xl font-extrabold">{selectedEvent.name}</h2>
                <p className="text-sm text-ink/50 dark:text-white/50 mt-1">
                  {MONTHS[parseInt(selectedEvent.date.split("-")[0]) - 1]} {selectedEvent.date.split("-")[1]}
                  {selectedEvent.endDate && ` – ${selectedEvent.endDate.split("-")[1]}`}
                </p>
                <Badge tone="green" className="mt-2">🪙 +{selectedEvent.coinsBonus} bonus coins</Badge>
              </div>

              <p className="text-sm text-ink/70 dark:text-white/70 leading-relaxed">{selectedEvent.description}</p>

              {selectedEvent.challengeTitle && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">🏆 Challenge</p>
                  <p className="font-bold text-sm">{selectedEvent.challengeTitle}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide mb-2">💡 Tips</p>
                <ul className="space-y-1.5">
                  {selectedEvent.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-ink/70 dark:text-white/70">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full" onClick={() => setSelectedEvent(null)}>Got it! 🌱</Button>
            </div>
          </div>
        )}

      </section>
    </MotionPage>
  );
}
