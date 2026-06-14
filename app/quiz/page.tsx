"use client";

import { useState, useEffect, useCallback } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRandomQuestions, QUIZ_CATEGORIES, type QuizQuestion } from "@/lib/quiz-data";

/* ─── Types ─── */
type QuizState = "menu" | "playing" | "result";
interface QuizHistory { date: string; score: number; total: number; coins: number; category: string }

/* ─── Main Page ─── */
export default function QuizPage() {
  const [state, setState] = useState<QuizState>("menu");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("greenstep-quiz-history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const startQuiz = useCallback(() => {
    const qs = getRandomQuestions(5, selectedCategory);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setTotalCoins(0);
    setStreak(0);
    setState("playing");
    setAnimate(true);
  }, [selectedCategory]);

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const q = questions[currentQ];
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
      setTotalCoins(c => c + q.coins);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setRevealed(false);
      setAnimate(true);
    } else {
      // Quiz complete — save history
      const entry: QuizHistory = {
        date: new Date().toISOString().slice(0, 10),
        score, total: questions.length, coins: totalCoins,
        category: selectedCategory,
      };
      const newHistory = [entry, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem("greenstep-quiz-history", JSON.stringify(newHistory));
      setState("result");
    }
  };

  const todayPlayed = history.some(h => h.date === new Date().toISOString().slice(0, 10));
  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0 ? (history.reduce((s, h) => s + h.score, 0) / totalQuizzes).toFixed(1) : "0";
  const lifetimeCoins = history.reduce((s, h) => s + h.coins, 0);

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* ── MENU ── */}
        {state === "menu" && (
          <>
            {/* Hero */}
            <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10 text-center py-4">
                <span className="text-4xl mb-3 block">🧠</span>
                <h1 className="font-heading text-3xl font-extrabold mb-2">Carbon Literacy Quiz</h1>
                <p className="text-white/70 text-sm max-w-md mx-auto">Test your knowledge about CO₂, climate, and sustainability. Earn coins for every correct answer!</p>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                  <div className="bg-white/10 rounded-xl px-4 py-2">
                    <p className="text-white/50 text-xs font-bold">Quizzes</p>
                    <p className="font-extrabold text-lg">{totalQuizzes}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2">
                    <p className="text-white/50 text-xs font-bold">Avg Score</p>
                    <p className="font-extrabold text-lg">{avgScore}/5</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2">
                    <p className="text-white/50 text-xs font-bold">Coins Earned</p>
                    <p className="font-extrabold text-lg">🪙 {lifetimeCoins}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category picker */}
            <Card>
              <CardHeader>
                <CardTitle>Choose a Topic</CardTitle>
                <CardDescription>5 random questions from your chosen category</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {QUIZ_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`rounded-xl border p-3 text-center transition font-bold text-sm ${
                      selectedCategory === cat.value
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-white dark:bg-white/5 dark:border-white/10 hover:border-primary"
                    }`}
                  >
                    <span className="text-xl block mb-1">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={startQuiz}>
                {todayPlayed ? "Play Again" : "🚀 Start Quiz"}
              </Button>
              {todayPlayed && (
                <p className="text-xs text-center mt-2 text-ink/50 dark:text-white/50 font-medium">
                  ✅ You already played today! You can still practice for fun.
                </p>
              )}
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                </CardHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.slice(0, 10).map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white dark:bg-white/5 border border-line dark:border-white/10 p-3">
                      <div>
                        <p className="font-bold text-sm">{h.date}</p>
                        <p className="text-xs text-ink/50 dark:text-white/50">
                          {QUIZ_CATEGORIES.find(c => c.value === h.category)?.emoji}{" "}
                          {QUIZ_CATEGORIES.find(c => c.value === h.category)?.label || "All"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge tone={h.score >= 4 ? "green" : h.score >= 2 ? "amber" : "muted"}>
                          {h.score}/{h.total}
                        </Badge>
                        <p className="text-xs font-bold text-primary mt-1">🪙 +{h.coins}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── PLAYING ── */}
        {state === "playing" && questions.length > 0 && (
          <>
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-line dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentQ + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-extrabold text-ink/60 dark:text-white/60 tabular-nums">
                {currentQ + 1}/{questions.length}
              </span>
            </div>

            {/* Score bar */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <Badge tone="green">✅ {score} correct</Badge>
                {streak >= 2 && <Badge tone="amber">🔥 {streak} streak!</Badge>}
              </div>
              <Badge tone="muted">🪙 {totalCoins} coins</Badge>
            </div>

            {/* Question card */}
            <Card
              className={`transition-all duration-300 ${animate ? "animate-[fadeSlideUp_400ms_ease-out_forwards]" : ""}`}
              onAnimationEnd={() => setAnimate(false)}
            >
              <div className="flex items-start gap-3 mb-4">
                <Badge tone={questions[currentQ].difficulty === "easy" ? "green" : questions[currentQ].difficulty === "medium" ? "amber" : "muted"}>
                  {questions[currentQ].difficulty} • 🪙 {questions[currentQ].coins}
                </Badge>
              </div>

              <h2 className="font-heading text-xl font-extrabold mb-6 leading-snug">
                {questions[currentQ].question}
              </h2>

              <div className="grid gap-3">
                {questions[currentQ].options.map((opt, idx) => {
                  let style = "border-line bg-white dark:bg-white/5 dark:border-white/10 hover:border-primary";
                  if (revealed) {
                    if (idx === questions[currentQ].correctIndex) {
                      style = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500/30";
                    } else if (idx === selected && idx !== questions[currentQ].correctIndex) {
                      style = "border-red-400 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-400/30";
                    } else {
                      style = "border-line/50 bg-white/50 dark:bg-white/3 dark:border-white/5 opacity-50";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={revealed}
                      className={`w-full text-left rounded-xl border p-4 font-bold text-sm transition-all ${style}`}
                    >
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-extrabold text-xs mr-3">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                      {revealed && idx === questions[currentQ].correctIndex && (
                        <span className="ml-2">✅</span>
                      )}
                      {revealed && idx === selected && idx !== questions[currentQ].correctIndex && (
                        <span className="ml-2">❌</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {revealed && (
                <div className="mt-5 rounded-xl bg-primary-light dark:bg-white/5 p-4 border border-primary/20">
                  <p className="font-bold text-sm text-primary-dark dark:text-primary mb-1">
                    {selected === questions[currentQ].correctIndex ? "🎉 Correct!" : "💡 Learn something new:"}
                  </p>
                  <p className="text-sm text-ink/70 dark:text-white/70 leading-relaxed">
                    {questions[currentQ].explanation}
                  </p>
                  <p className="text-xs font-bold text-primary mt-2">
                    📊 {questions[currentQ].co2Fact}
                  </p>
                </div>
              )}

              {revealed && (
                <Button className="w-full mt-4" onClick={handleNext}>
                  {currentQ < questions.length - 1 ? "Next Question →" : "See Results 🎯"}
                </Button>
              )}
            </Card>
          </>
        )}

        {/* ── RESULT ── */}
        {state === "result" && (
          <>
            <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white text-center py-8">
              <span className="text-5xl block mb-4">
                {score === 5 ? "🏆" : score >= 3 ? "🌟" : "📚"}
              </span>
              <h2 className="font-heading text-3xl font-extrabold mb-2">
                {score === 5 ? "Perfect Score!" : score >= 3 ? "Great Job!" : "Keep Learning!"}
              </h2>
              <p className="text-6xl font-black my-4 tabular-nums">{score}<span className="text-2xl text-white/50">/{questions.length}</span></p>
              <div className="flex justify-center gap-6 mt-4">
                <div>
                  <p className="text-white/50 text-xs font-bold">Coins Earned</p>
                  <p className="text-xl font-extrabold">🪙 {totalCoins}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold">Best Streak</p>
                  <p className="text-xl font-extrabold">🔥 {streak}</p>
                </div>
              </div>
            </Card>

            {/* Review answers */}
            <Card>
              <CardHeader>
                <CardTitle>Review Answers</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-line dark:border-white/10 p-3">
                    <p className="font-bold text-sm mb-1">
                      {i + 1}. {q.question}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                      ✅ {q.options[q.correctIndex]}
                    </p>
                    <p className="text-xs text-ink/50 dark:text-white/50 mt-1">
                      {q.co2Fact}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setState("menu")}>
                ← Back to Menu
              </Button>
              <Button onClick={startQuiz}>
                🔄 Play Again
              </Button>
            </div>
          </>
        )}
      </section>
    </MotionPage>
  );
}
