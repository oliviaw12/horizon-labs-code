"use client";

import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mock data for development
const MOCK_PRACTICE_QUIZ_ANALYTICS = {
  generated_at: new Date().toISOString(),
  quizzes: [
    {
      quiz_id: "bio_fundamentals",
      title: "Biology Fundamentals",
      sessions: 18,
      total_questions: 240,
      correct_questions: 197,
      accuracy: 0.82,
      topics: [
        { name: "Cell Structure", correct: 48, total: 52, accuracy: 0.92 },
        { name: "Genetics", correct: 36, total: 50, accuracy: 0.72 },
        { name: "Metabolism", correct: 55, total: 66, accuracy: 0.83 },
        { name: "Ecology", correct: 58, total: 72, accuracy: 0.81 },
      ],
    },
    {
      quiz_id: "chemistry_essentials",
      title: "Chemistry Essentials",
      sessions: 14,
      total_questions: 180,
      correct_questions: 139,
      accuracy: 0.77,
      topics: [
        { name: "Atomic Structure", correct: 32, total: 40, accuracy: 0.8 },
        { name: "Chemical Bonds", correct: 44, total: 58, accuracy: 0.76 },
        { name: "Stoichiometry", correct: 29, total: 44, accuracy: 0.66 },
        { name: "Thermochemistry", correct: 34, total: 38, accuracy: 0.89 },
      ],
    },
    {
      quiz_id: "algebra_review",
      title: "Algebra Readiness",
      sessions: 21,
      total_questions: 210,
      correct_questions: 181,
      accuracy: 0.86,
      topics: [
        { name: "Linear Equations", correct: 52, total: 58, accuracy: 0.9 },
        { name: "Quadratics", correct: 41, total: 50, accuracy: 0.82 },
        { name: "Inequalities", correct: 47, total: 52, accuracy: 0.9 },
        { name: "Functions", correct: 41, total: 50, accuracy: 0.82 },
      ],
    },
  ],
};

// Generate mock daily data for the past 30 days
const generateMockDailyData = () => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    // Random but realistic data
    const good = Math.floor(Math.random() * 15) + 5;
    const needs = Math.floor(Math.random() * 8) + 2;
    days.push({ date: dateStr, good, needs_focusing: needs });
  }
  return days;
};

const MOCK_CHAT_ANALYTICS = {
  generated_at: new Date().toISOString(),
  totals: { good: 36, needs_focusing: 12 },
  daily_data: generateMockDailyData(),
};

// Fetch placeholder - simulates async operation with mock data
const fetchPlaceholder = async (mockData, delay = 500) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return {
    ok: true,
    json: async () => mockData,
  };
};

export default function InstructorDashboard() {
  const [practiceQuizzes, setPracticeQuizzes] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [isQuizLoading, setIsQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setIsQuizLoading(true);
      setQuizError(null);
      try {
        const response = await fetchPlaceholder(MOCK_PRACTICE_QUIZ_ANALYTICS);
        const data = await response.json();
        if (!isMounted) return;
        setPracticeQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
        setGeneratedAt(data.generated_at || null);
      } catch (err) {
        if (!isMounted) return;
        setQuizError(err instanceof Error ? err.message : "Unknown error occurred.");
      } finally {
        if (isMounted) {
          setIsQuizLoading(false);
        }
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const aggregateQuizStats = useMemo(() => {
    if (!practiceQuizzes.length) {
      return { averageAccuracy: 0, totalSessions: 0, totalQuestions: 0 };
    }
    const totals = practiceQuizzes.reduce(
      (acc, quiz) => {
        const accuracy = typeof quiz.accuracy === "number" ? quiz.accuracy : 0;
        acc.accuracySum += accuracy;
        acc.totalSessions += quiz.sessions || 0;
        acc.totalQuestions += quiz.total_questions || 0;
        return acc;
      },
      { accuracySum: 0, totalSessions: 0, totalQuestions: 0 },
    );
    return {
      averageAccuracy: Math.round((totals.accuracySum / practiceQuizzes.length) * 100),
      totalSessions: totals.totalSessions,
      totalQuestions: totals.totalQuestions,
    };
  }, [practiceQuizzes]);

  const formattedGeneratedAt = useMemo(() => {
    if (!generatedAt) return "--";
    const date = new Date(generatedAt);
    if (Number.isNaN(date.getTime())) return generatedAt;
    return date.toLocaleString();
  }, [generatedAt]);

  const [chatStats, setChatStats] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [chatError, setChatError] = useState(null);
  const [chatViewMode, setChatViewMode] = useState("week"); // "week" or "month"

  useEffect(() => {
    let isMounted = true;
    const fetchChatAnalytics = async () => {
      setIsChatLoading(true);
      setChatError(null);
      try {
        const response = await fetchPlaceholder(MOCK_CHAT_ANALYTICS);
        const data = await response.json();
        if (!isMounted) return;
        setChatStats(data);
      } catch (err) {
        if (!isMounted) return;
        setChatError(err instanceof Error ? err.message : "Unknown error occurred.");
      } finally {
        if (isMounted) {
          setIsChatLoading(false);
        }
      }
    };

    fetchChatAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDailyData = useMemo(() => {
    if (!chatStats?.daily_data) return [];
    const data = chatStats.daily_data;
    if (chatViewMode === "week") {
      return data.slice(-7); // Last 7 days
    }
    return data; // All 30 days for month view
  }, [chatStats, chatViewMode]);

  const chatTotals = useMemo(() => {
    // Calculate cumulative totals based on filtered daily data
    if (filteredDailyData.length === 0) {
      return { good: 0, needs: 0, total: 0, goodPercent: 0 };
    }
    const good = filteredDailyData.reduce((sum, day) => sum + (day.good || 0), 0);
    const needs = filteredDailyData.reduce((sum, day) => sum + (day.needs_focusing || 0), 0);
    const total = good + needs;
    return { good, needs, total, goodPercent: total ? Math.round((good / total) * 100) : 0 };
  }, [filteredDailyData]);

  const maxDailyValue = useMemo(() => {
    if (filteredDailyData.length === 0) return 1;
    return Math.max(
      ...filteredDailyData.map((d) => (d.good || 0) + (d.needs_focusing || 0)),
      1,
    );
  }, [filteredDailyData]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="flex h-full min-h-screen flex-col xl:flex-row">
        {/* left border line */}
        <div className="hidden xl:block w-80 bg-white border-r border-[#9690B7] relative z-10" />

        {/* Main Content Area */}
        <div className="flex-1 bg-white relative z-10">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col px-6 py-10 sm:px-10 lg:px-16">
            <div className="flex flex-col max-w-5xl pt-10 sm:pt-12 lg:pt-16 gap-6">
              <div>
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 ${poppins.className}`}
                >
                  Analytics Dashboard
                </h1>
                <p className={`text-base sm:text-lg text-gray-500 ${poppins.className}`}>
                  Track practice quiz accuracy overall, then drill into topics that need attention.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
                  <p className={`text-sm text-gray-500 ${poppins.className}`}>Tracked Quizzes</p>
                  <p className={`text-3xl font-semibold text-gray-900 mt-2 ${poppins.className}`}>
                    {isQuizLoading ? "--" : practiceQuizzes.length}
                  </p>
                  <p className={`text-sm text-gray-500 mt-2 ${poppins.className}`}>
                    {isQuizLoading ? "Gathering sessions…" : `${aggregateQuizStats.totalSessions} sessions reviewed`}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
                  <p className={`text-sm text-gray-500 ${poppins.className}`}>Average Accuracy</p>
                  <p className={`text-3xl font-semibold text-gray-900 mt-2 ${poppins.className}`}>
                    {isQuizLoading ? "--" : `${aggregateQuizStats.averageAccuracy}%`}
                  </p>
                  <p className={`text-sm text-gray-500 mt-2 ${poppins.className}`}>
                    Share of correct answers per quiz
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                  <p className={`text-sm text-gray-500 ${poppins.className}`}>Last Updated</p>
                  <p className={`text-lg font-medium text-gray-900 mt-2 ${poppins.className}`}>
                    {isQuizLoading ? "Loading..." : formattedGeneratedAt}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-xl font-semibold text-gray-900 ${poppins.className}`}>
                      Practice Quiz Performance
                    </h2>
                    <p className={`text-sm text-gray-500 ${poppins.className}`}>
                      Percent questions answered correctly per quiz, plus topic drill-down.
                    </p>
                  </div>
                  {!isQuizLoading && practiceQuizzes.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {aggregateQuizStats.totalQuestions.toLocaleString()} questions graded
                    </div>
                  )}
                </div>

                {quizError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {quizError}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {isQuizLoading ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                        Loading practice quiz analytics…
                      </div>
                    ) : practiceQuizzes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                        No quiz attempts recorded yet.
                      </div>
                    ) : (
                      practiceQuizzes.map((quiz) => {
                        const accuracyValue =
                          typeof quiz.accuracy === "number"
                            ? quiz.accuracy
                            : quiz.total_questions
                              ? (quiz.correct_questions || 0) / quiz.total_questions
                              : 0;
                        const accuracyPercent = Math.round(Math.min(Math.max(accuracyValue, 0), 1) * 100);
                        return (
                          <div
                            key={quiz.quiz_id || quiz.title}
                            className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-inner"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className={`text-lg font-semibold text-gray-900 ${poppins.className}`}>
                                  {quiz.title}
                                </h3>
                                <p className={`text-sm text-gray-500 ${poppins.className}`}>
                                  {`${quiz.sessions || 0} sessions · ${quiz.correct_questions || 0}/${
                                    quiz.total_questions || 0
                                  } correct`}
                                </p>
                              </div>
                              <div className="text-3xl font-semibold text-emerald-600">{accuracyPercent}%</div>
                            </div>
                            <div className="mt-4 h-3 w-full rounded-full bg-gray-200/70">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 transition-all"
                                style={{ width: `${accuracyPercent}%` }}
                              />
                            </div>
                            {Array.isArray(quiz.topics) && quiz.topics.length > 0 && (
                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {quiz.topics.map((topic) => {
                                  const topicValue =
                                    typeof topic.accuracy === "number"
                                      ? topic.accuracy
                                      : topic.total
                                        ? (topic.correct || 0) / topic.total
                                        : 0;
                                  const topicPercent = Math.round(Math.min(Math.max(topicValue, 0), 1) * 100);
                                  return (
                                    <div
                                      key={`${quiz.quiz_id}-${topic.name}`}
                                      className="rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                                        <span>{topic.name}</span>
                                        <span>{topicPercent}%</span>
                                      </div>
                                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                                          style={{ width: `${topicPercent}%` }}
                                        />
                                      </div>
                                      <p className="mt-1 text-xs text-gray-500">
                                        {(topic.correct || 0)}/{topic.total || 0} correct
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`text-xl font-semibold text-gray-900 ${poppins.className}`}>
                      Adaptive Chat Quality (Cumulative)
                    </h2>
                    <p className={`text-sm text-gray-500 ${poppins.className}`}>
                      Cumulative totals of good vs. needs_focusing classifications for the last {chatViewMode === "week" ? "7 days" : "30 days"}.
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isChatLoading
                      ? "Loading…"
                      : `${chatTotals.goodPercent}% of turns marked as good`}
                  </div>
                </div>

                {chatError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {chatError}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-inner flex flex-col items-center justify-center">
                      {isChatLoading ? (
                        <div className="text-sm text-gray-500">Loading chart…</div>
                      ) : chatTotals.total === 0 ? (
                        <div className="text-sm text-gray-500">No labeled turns yet.</div>
                      ) : (
                        <svg viewBox="0 0 200 200" className="w-56 h-56">
                          {(() => {
                            const goodAngle = (chatTotals.good / chatTotals.total) * 360;
                            const needsAngle = 360 - goodAngle;
                            const describeArc = (startAngle, sweep, color) => {
                              const radius = 90;
                              const center = 100;
                              const start = ((startAngle - 90) * Math.PI) / 180;
                              const end = ((startAngle + sweep - 90) * Math.PI) / 180;
                              const startX = center + radius * Math.cos(start);
                              const startY = center + radius * Math.sin(start);
                              const endX = center + radius * Math.cos(end);
                              const endY = center + radius * Math.sin(end);
                              const largeArc = sweep > 180 ? 1 : 0;
                              return (
                                <path
                                  d={`M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                  fill={color}
                                  opacity={0.92}
                                />
                              );
                            };
                            return (
                              <>
                                {describeArc(0, goodAngle, "url(#goodGradient)")}
                                {describeArc(goodAngle, needsAngle, "url(#needsGradient)")}
                                <defs>
                                  <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#10b981" />
                                  </linearGradient>
                                  <linearGradient id="needsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#f97316" />
                                  </linearGradient>
                                </defs>
                              </>
                            );
                          })()}
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                        <span>Good turns: {isChatLoading ? "--" : chatTotals.good}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                        <span>Needs focusing: {isChatLoading ? "--" : chatTotals.needs}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="inline-block h-3 w-3 rounded-full bg-slate-300" />
                        <span>Total labeled turns: {isChatLoading ? "--" : chatTotals.total}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Bar Chart */}
                {!chatError && !isChatLoading && (
                  <div className="mt-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold text-gray-900 ${poppins.className}`}>
                        Daily Turn Classifications
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChatViewMode("week")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chatViewMode === "week"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } ${poppins.className}`}
                        >
                          Week
                        </button>
                        <button
                          onClick={() => setChatViewMode("month")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chatViewMode === "month"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } ${poppins.className}`}
                        >
                          Month
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
                      {isChatLoading ? (
                        <div className="text-sm text-gray-500 text-center py-8">Loading daily data…</div>
                      ) : filteredDailyData.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8">No daily data available.</div>
                      ) : (
                        <div className="flex h-64 items-end gap-2 overflow-x-auto overflow-y-visible pb-4 pt-8">
                          {filteredDailyData.map((day) => {
                            const good = day.good || 0;
                            const needs = day.needs_focusing || 0;
                            const maxBarHeight = 200; // Fixed max height in pixels
                            const goodHeight = maxDailyValue > 0 ? (good / maxDailyValue) * maxBarHeight : 0;
                            const needsHeight = maxDailyValue > 0 ? (needs / maxDailyValue) * maxBarHeight : 0;
                            const date = new Date(day.date);
                            const dateLabel =
                              chatViewMode === "week"
                                ? date.toLocaleDateString("en-US", { weekday: "short" })
                                : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                            return (
                              <div key={day.date} className="flex flex-col items-center flex-1 min-w-[60px] gap-2">
                                <div className="relative w-full h-52 flex items-end justify-center gap-1.5 bg-gradient-to-t from-gray-50 to-white rounded-xl border border-gray-100 p-2">
                                  {/* Good bar */}
                                  <div className="flex flex-col items-center justify-end flex-1 h-full relative">
                                    <span className="text-xs font-medium text-gray-600 text-center">{good}</span>
                                    <div
                                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm transition-all duration-300 hover:opacity-90"
                                      style={{ height: `${Math.max(goodHeight, good > 0 ? 8 : 0)}px` }}
                                    />
                                  </div>
                                  {/* Needs focusing bar */}
                                  <div className="flex flex-col items-center justify-end flex-1 h-full relative">
                                    <span className="text-xs font-medium text-gray-600 text-center">{needs}</span>
                                    <div
                                      className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm transition-all duration-300 hover:opacity-90"
                                      style={{ height: `${Math.max(needsHeight, needs > 0 ? 8 : 0)}px` }}
                                      title={`Needs focusing: ${needs}`}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-gray-600 text-center">{dateLabel}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded bg-emerald-500" />
                          <span>Good turns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded bg-amber-500" />
                          <span>Needs focusing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Right Panel */}
        <div className="hidden lg:block lg:w-40 xl:w-72 2xl:w-80 bg-purple-100 border-l border-gray-300 relative z-20" />
      </div>

      {/* Gradients */}
      <img src="/gradient1.png" alt="Gradient decoration" className="fixed bottom-0 left-0 w-40 sm:w-56 lg:w-72 z-20" />
    </div>
  );
}