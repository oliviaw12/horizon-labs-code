"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConditionalHeader from "../../components/ConditionalHeader";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Unable to parse stored quiz preview value", error);
    return null;
  }
};

const DEFAULT_RESULTS = {
  correctAnswers: 0,
  totalQuestions: 0,
  percentage: 0,
};

export default function QuizScorePage() {
  const router = useRouter();
  const [results, setResults] = useState(DEFAULT_RESULTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const questions = safeParse(localStorage.getItem("quizPreviewQuestions")) || [];
    const responses = safeParse(localStorage.getItem("quizPreviewResponses")) || [];
    const total = questions.length;
    const correct = responses.filter((entry) => entry?.isCorrect).length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    setResults({
      correctAnswers: correct,
      totalQuestions: total,
      percentage,
    });
    setIsLoading(false);
  }, []);

  const handleEditQuiz = () => {
    router.push("/Instructor/QuizGenerator");
  };

  const handlePublishQuiz = () => {
    router.push("/Instructor/MyQuiz");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col">
        <ConditionalHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-purple-900 text-xl ${poppins.className}`}>
            Calculating results...
          </div>
        </div>
      </div>
    );
  }

  const { percentage, correctAnswers, totalQuestions } = results;

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <ConditionalHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full">
        <div className="mb-12">
          <div
            className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #EC4899, #F472B6)",
            }}
          >
            <div className="text-white text-center">
              <p className={`text-lg font-medium mb-2 ${poppins.className}`}>
                Your Score
              </p>
              <p className={`text-6xl font-bold mb-2 ${poppins.className}`}>
                {percentage}%
              </p>
              <p className={`text-base font-medium ${poppins.className}`}>
                {correctAnswers}/{totalQuestions} questions
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={handleEditQuiz}
            className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
            }}
          >
            Edit Quiz
          </button>

          <button
            onClick={handlePublishQuiz}
            className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #EC4899, #F97316)",
            }}
          >
            Publish Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
