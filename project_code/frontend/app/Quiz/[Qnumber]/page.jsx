"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    prompt: "Which sorting algorithm has the best average-case time complexity?",
    options: [
      { id: "A", text: "Bubble sort" },
      { id: "B", text: "Selection sort" },
      { id: "C", text: "Merge sort" },
      { id: "D", text: "Insertion sort" },
    ],
    correctOption: "C",
    explanation: "Merge sort runs in O(n log n) time on average, which is better than the quadratic alternatives.",
  },
  {
    id: "q2",
    prompt: "What does HTTP status code 201 indicate?",
    options: [
      { id: "A", text: "Request was successful" },
      { id: "B", text: "Resource was created" },
      { id: "C", text: "Request was malformed" },
      { id: "D", text: "Server error occurred" },
    ],
    correctOption: "B",
    explanation: "201 Created indicates the server successfully created a new resource as a result of the request.",
  },
  {
    id: "q3",
    prompt: "Which HTML element is semantically appropriate for marking up navigation links?",
    options: [
      { id: "A", text: "<section>" },
      { id: "B", text: "<nav>" },
      { id: "C", text: "<aside>" },
      { id: "D", text: "<header>" },
    ],
    correctOption: "B",
    explanation: "The <nav> element is designed to contain navigation links.",
  },
];

const DEFAULT_META = {
  mode: "assessment",
  configuration: {
    numberOfQuestions: DEFAULT_QUESTIONS.length,
  },
};

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Unable to parse stored quiz preview value", error);
    return null;
  }
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const questionNumber = useMemo(() => {
    const raw = params?.Qnumber ?? params?.qnumber ?? "1";
    const parsed = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [params]);

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [responses, setResponses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionIndex = questionNumber - 1;
  const totalQuestions = questions.length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedQuestions = safeParse(localStorage.getItem("quizPreviewQuestions"));
    const questionSet = Array.isArray(storedQuestions) && storedQuestions.length
      ? storedQuestions
      : DEFAULT_QUESTIONS;
    if (!storedQuestions || !storedQuestions.length) {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questionSet));
    }

    const storedMeta = safeParse(localStorage.getItem("quizPreviewData")) || DEFAULT_META;
    const storedResponses = safeParse(localStorage.getItem("quizPreviewResponses")) || [];

    setQuestions(questionSet);
    setMeta(storedMeta);
    setResponses(storedResponses);

    if (questionIndex >= questionSet.length) {
      router.replace("/Quiz/Score");
      return;
    }

    const existing = storedResponses[questionIndex];
    setSelectedAnswer(existing?.selectedAnswer ?? null);
    setIsLoading(false);
  }, [questionIndex, router]);

  const currentQuestion = questions[questionIndex];

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
  };

  const goToQuestion = (index) => {
    if (index >= questions.length) {
      router.push("/Quiz/Score");
      return;
    }
    if (index < 0) {
      router.push("/Quiz/1");
      return;
    }
    router.push(`/Quiz/${index + 1}`);
  };

  const persistResponses = (updatedResponses) => {
    setResponses(updatedResponses);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("quizPreviewResponses", JSON.stringify(updatedResponses));
      }
    } catch (error) {
      console.error("Unable to persist quiz responses", error);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) {
      alert("Please select an answer before continuing.");
      return;
    }

    setIsSubmitting(true);
    const question = questions[questionIndex];
    const isCorrect = selectedAnswer === question.correctOption;
    const updatedResponses = [...responses];
    updatedResponses[questionIndex] = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
      correctOption: question.correctOption,
    };
    persistResponses(updatedResponses);
    setIsSubmitting(false);

    goToQuestion(questionIndex + 1);
  };

  const handleSkip = () => {
    const updatedResponses = [...responses];
    updatedResponses[questionIndex] = {
      questionId: currentQuestion?.id,
      selectedAnswer: null,
      isCorrect: false,
      correctOption: currentQuestion?.correctOption,
    };
    persistResponses(updatedResponses);
    setSelectedAnswer(null);
    goToQuestion(questionIndex + 1);
  };

  const handleBack = () => {
    goToQuestion(questionIndex - 1);
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Loading question...
        </div>
      </div>
    );
  }

  const progress = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const modeLabel = meta.mode === "practice" ? "Practice" : "Assessment";

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-lg font-medium text-purple-900 ${poppins.className}`}>
            {modeLabel} Quiz • Question {questionNumber} of {totalQuestions}
          </h2>
          <span className={`text-sm uppercase tracking-wide text-gray-500 ${poppins.className}`}>
            Progress: {progress}%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className={`text-2xl font-bold text-purple-900 mb-6 ${poppins.className}`}>
              {currentQuestion.prompt}
            </h1>
            <div className="mb-8">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-purple-200 border-2 border-purple-600"
                        : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                    } ${poppins.className}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          isSelected ? "text-purple-900" : "text-gray-600"
                        }`}
                      >
                        {option.id}.
                      </span>
                      <span
                        className={
                          isSelected
                            ? "text-purple-900 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={questionIndex === 0}
              className={`px-5 py-2 rounded-lg border border-purple-400 text-purple-700 font-medium transition-all duration-300 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed ${poppins.className}`}
            >
              Previous
            </button>
            <button
              onClick={handleSkip}
              className={`px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium transition-all duration-300 hover:bg-gray-100 ${poppins.className}`}
            >
              Skip
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
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
