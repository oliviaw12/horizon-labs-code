"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const MOCK_QUIZZES = [
  {
    id: "quiz-101",
    title: "Algorithms Midterm Prep",
    description: "Focuses on sorting, searching, and graph traversal fundamentals.",
    totalQuestions: 12,
    mode: "assessment",
    createdAt: "2025-09-21T10:30:00Z",
  },
  {
    id: "quiz-204",
    title: "Data Structures Drill",
    description: "Practice mode deck covering stacks, queues, and trees.",
    totalQuestions: 20,
    mode: "practice",
    createdAt: "2025-10-03T14:15:00Z",
  },
  {
    id: "quiz-305",
    title: "Systems Programming Review",
    description: "Pointers, memory management, and concurrency refresher.",
    totalQuestions: 8,
    mode: "assessment",
    createdAt: "2025-10-17T09:05:00Z",
  },
];

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const quizzes = useMemo(() => MOCK_QUIZZES, []);
  const hasQuizzes = quizzes.length > 0;

  const handleCreateQuiz = () => {
    router.push("/Instructor/QuizGenerator");
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold text-purple-900 mb-2 ${poppins.className}`}>
              My Quizzes
            </h1>
            <p className={`text-base text-gray-600 ${poppins.className}`}>
              Quizzes will simulate real tests/exams with time limits.
            </p>
          </div>
          <button
            onClick={handleCreateQuiz}
            className={`px-6 py-3 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{ background: "linear-gradient(to right, #7B2CBF, #3B82F6)" }}
          >
            + Create a Quiz
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white p-12 min-h-[500px]">
          {hasQuizzes ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className={`text-xl font-semibold text-purple-900 mb-2 ${poppins.className}`}>
                    {quiz.title}
                  </h3>
                  <p className={`text-sm text-gray-600 mb-2 ${poppins.className}`}>
                    {quiz.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Questions: {quiz.totalQuestions}</span>
                    <span>Mode: {quiz.mode}</span>
                    <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className={`text-lg text-gray-600 mb-6 ${poppins.className}`}>
                Quizzes you create will appear here
              </p>
              <div className="mb-8 relative w-64 h-64">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="40" y="80" width="120" height="100" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="2" rx="4" />
                  <rect x="40" y="80" width="120" height="30" fill="#E5E7EB" />
                  <path d="M40 80 L100 50 L160 80" stroke="#9CA3AF" strokeWidth="2" fill="none" />
                  <circle cx="90" cy="40" r="8" fill="#7B2CBF" opacity="0.8" />
                  <circle cx="110" cy="35" r="6" fill="#EC4899" opacity="0.8" />
                  <circle cx="85" cy="50" r="7" fill="#3B82F6" opacity="0.8" />
                  <circle cx="115" cy="45" r="5" fill="#F97316" opacity="0.8" />
                  <rect x="95" y="25" width="10" height="10" rx="2" fill="#10B981" opacity="0.8" />
                  <rect x="105" y="30" width="8" height="8" rx="2" fill="#EF4444" opacity="0.8" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
