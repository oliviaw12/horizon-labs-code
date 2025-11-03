"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
const GET_QUESTION_ENDPOINT = `${API_BASE_URL}/quiz/question`;
const SUBMIT_ANSWER_ENDPOINT = `${API_BASE_URL}/quiz/submit`;

// Placeholder API function to get question
const fetchQuestion = async (questionNumber, quizId) => {
  try {
    const response = await fetch(
      `${GET_QUESTION_ENDPOINT}?question_number=${questionNumber}&quiz_id=${quizId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch question: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching question:", error);
    // Return mock data for development
    return {
      question: {
        id: questionNumber,
        text: "In Heapsort, after each extraction of the maximum element from a max heap, what operation is performed to restore the heap property?",
        options: [
          { id: "A", text: "Option 1" },
          { id: "B", text: "Option 2" },
          { id: "C", text: "Option 3" },
          { id: "D", text: "Option 4" },
        ],
      },
      totalQuestions: 5,
      currentQuestion: questionNumber,
    };
  }
};

// Placeholder API function to submit answer
const submitAnswer = async (questionId, selectedAnswer, quizId) => {
  try {
    const response = await fetch(SUBMIT_ANSWER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question_id: questionId,
        answer: selectedAnswer,
        quiz_id: quizId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting answer:", error);
    // Return mock response for development
    return {
      success: true,
      message: "Answer submitted successfully",
    };
  }
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  // Handle dynamic route parameter - adjust based on actual folder structure
  // If folder is [Qnumber], use params.Qnumber; if folder is [qnumber], use params.qnumber
  const questionNumber = parseInt(params?.Qnumber || params?.qnumber || "1") || 1;

  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizId, setQuizId] = useState(null); // Should be obtained from context or route params

  useEffect(() => {
    // Get quiz ID from localStorage or route params
    const storedQuizId = localStorage.getItem("currentQuizId");
    if (storedQuizId) {
      setQuizId(storedQuizId);
    }

    // Fetch question data
    const loadQuestion = async () => {
      setIsLoading(true);
      try {
        const data = await fetchQuestion(questionNumber, storedQuizId || "default");
        setQuestion(data.question);
        setTotalQuestions(data.totalQuestions || 5);
      } catch (error) {
        console.error("Failed to load question:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [questionNumber]);

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAnswer(question.id, selectedAnswer, quizId || "default");
      
      // Navigate to next question or results page
      if (questionNumber < totalQuestions) {
        router.push(`/Instructor/Quiz${questionNumber + 1}`);
      } else {
        router.push("/Instructor/QuizResults");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Loading question...
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Question not found
        </div>
      </div>
    );
  }

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Question Header */}
        <div className="mb-6">
          <h2
            className={`text-lg font-medium text-purple-900 ${poppins.className}`}
          >
            Question {questionNumber} of {totalQuestions}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Question */}
          <div className="lg:col-span-2">
            <h1
              className={`text-2xl font-bold text-purple-900 mb-6 ${poppins.className}`}
            >
              {question.text}
            </h1>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Answer Options */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-200 ${
                    selectedAnswer === option.id
                      ? "bg-purple-200 border-2 border-purple-600"
                      : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                  } ${poppins.className}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        selectedAnswer === option.id
                          ? "text-purple-900"
                          : "text-gray-600"
                      }`}
                    >
                      {option.id}.
                    </span>
                    <span
                      className={
                        selectedAnswer === option.id
                          ? "text-purple-900 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Submit Button and User Icon */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #EC4899, #F97316)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

