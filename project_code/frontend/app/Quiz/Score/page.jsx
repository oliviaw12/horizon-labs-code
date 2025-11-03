"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// API Configuration
const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);
const GET_QUIZ_RESULTS_ENDPOINT = `${API_BASE_URL}/quiz/results`;

// Placeholder API function to get quiz results
const fetchQuizResults = async (quizId) => {
  try {
    const response = await fetch(
      `${GET_QUIZ_RESULTS_ENDPOINT}?quiz_id=${quizId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    // Return mock data for development
    return {
      score: 100,
      correctAnswers: 5,
      totalQuestions: 5,
      percentage: 100,
    };
  }
};

export default function QuizScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quiz_id") || localStorage.getItem("currentQuizId") || "default";

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const data = await fetchQuizResults(quizId);
        setResults(data);
      } catch (error) {
        console.error("Failed to load results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [quizId]);

  const handleRetakeQuiz = () => {
    // Navigate to first question of the quiz
    router.push(`/Quiz/1?quiz_id=${quizId}`);
  };

  const handleBackToHome = () => {
    // Navigate to home page
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Loading results...
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Results not found
        </div>
      </div>
    );
  }

  const percentage = results.percentage || Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const correctAnswers = results.correctAnswers || 0;
  const totalQuestions = results.totalQuestions || 5;

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center px-6 py-12 w-full">
        {/* Score Circle */}
        <div className="mb-12">
          <div
            className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #EC4899, #F472B6)",
            }}
          >
            <div className="text-white text-center">
              <p className={`text-lg font-medium mb-2 ${poppins.className}`}>
                Your Score:
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Retake Quiz Button */}
          <button
            onClick={handleRetakeQuiz}
            className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #EC4899, #F97316)",
            }}
          >
            Retake Quiz
          </button>

          {/* Back to Home Button */}
          <button
            onClick={handleBackToHome}
            className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

