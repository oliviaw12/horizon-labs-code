"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const QUESTION_TEMPLATES = [
  {
    id: "q1",
    prompt: "Which sorting algorithm has the best average-case time complexity?",
    options: [
      { id: "A", text: "Bubble sort", reason: "Bubble sort is O(n²) on average, so it's slower." },
      { id: "B", text: "Selection sort", reason: "Selection sort is also O(n²), not optimal." },
      { id: "C", text: "Merge sort", reason: "Merge sort runs in O(n log n) time on average." },
      { id: "D", text: "Insertion sort", reason: "Insertion sort is O(n²) in the general case." },
    ],
    correctOption: "C",
    explanation: "Merge sort runs in O(n log n) time on average, which is better than the quadratic alternatives.",
  },
  {
    id: "q2",
    prompt: "What does HTTP status code 201 indicate?",
    options: [
      { id: "A", text: "Request was successful", reason: "200 OK represents a generic success." },
      { id: "B", text: "Resource was created", reason: "201 Created is returned after creating a resource." },
      { id: "C", text: "Request was malformed", reason: "400 Bad Request is used for malformed requests." },
      { id: "D", text: "Server error occurred", reason: "5xx status codes cover server errors." },
    ],
    correctOption: "B",
    explanation: "201 Created indicates the server successfully created a new resource as a result of the request.",
  },
];

const INITIAL_QUESTIONS = QUESTION_TEMPLATES.slice(0, 1);
const QUIZ_PREVIEW_VERSION = "v2-single-start";

const DEFAULT_META = {
  mode: "assessment",
  configuration: {
    numberOfQuestions: QUESTION_TEMPLATES.length,
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

  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [responses, setResponses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [showResult, setShowResult] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  const questionIndex = Math.max(
    0,
    Math.min(questionNumber - 1, Math.max(questions.length - 1, 0))
  );

  const persistQuestions = (payload) => {
    setQuestions(payload);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("quizPreviewQuestions", JSON.stringify(payload));
        localStorage.setItem("quizPreviewQuestionsVersion", QUIZ_PREVIEW_VERSION);
      }
    } catch (error) {
      console.error("Unable to persist quiz preview questions", error);
    }
  };

  const appendQuestion = (difficultyOverride) => {
    const templateIndex = questions.length % QUESTION_TEMPLATES.length;
    const template = QUESTION_TEMPLATES[templateIndex];
    const nextQuestion = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      difficulty: difficultyOverride || template.difficulty,
    };
    const nextList = [...questions, nextQuestion];
    persistQuestions(nextList);
    return nextList;
  };

  const applyStoredResponse = (response, question) => {
    if (response && question) {
      setSelectedAnswer(response.selectedAnswer ?? null);
      setShowResult(response.selectedAnswer != null);
      setResultSummary({
        isCorrect: response.isCorrect,
        selectedAnswer: response.selectedAnswer,
        correctAnswer: response.correctOption ?? question.correctOption,
      });
    } else {
      setSelectedAnswer(null);
      setShowResult(false);
      setResultSummary(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedQuestions = safeParse(localStorage.getItem("quizPreviewQuestions"));
    const storedVersion = localStorage.getItem("quizPreviewQuestionsVersion");
    const shouldReset = storedVersion !== QUIZ_PREVIEW_VERSION;

    const questionSet =
      Array.isArray(storedQuestions) && storedQuestions.length && !shouldReset
        ? storedQuestions
        : INITIAL_QUESTIONS;

    if (!storedQuestions || !storedQuestions.length || shouldReset) {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questionSet));
      localStorage.setItem("quizPreviewQuestionsVersion", QUIZ_PREVIEW_VERSION);
    }

    const storedMeta = safeParse(localStorage.getItem("quizPreviewData")) || DEFAULT_META;
    const storedResponses = safeParse(localStorage.getItem("quizPreviewResponses")) || [];

    setQuestions(questionSet);
    setMeta(storedMeta);
    setResponses(storedResponses);

    const responseIndex = Math.max(0, Math.min(questionNumber - 1, questionSet.length - 1));
    const existing = storedResponses[responseIndex];
    applyStoredResponse(existing, questionSet[responseIndex]);
    setIsLoading(false);
  }, [questionNumber]);

  useEffect(() => {
    if (isLoading) return;
    const currentResponse = responses[questionIndex];
    applyStoredResponse(currentResponse, questions[questionIndex]);
  }, [responses, questionIndex, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const maxQuestionNumber = Math.max(questions.length, 1);
    if (questionNumber > maxQuestionNumber) {
      router.replace(`/Quiz/${maxQuestionNumber}`);
    }
  }, [isLoading, questionNumber, questions.length, router]);

  const currentQuestion = questions[questionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className={`text-purple-900 text-xl ${poppins.className}`}>
          Preparing preview...
        </div>
      </div>
    );
  }
  const currentTopic =
    Array.isArray(meta?.topicsToTest) && meta.topicsToTest.length > 0
      ? meta.topicsToTest[Math.min(questionIndex, meta.topicsToTest.length - 1)]
      : "General";
  const currentDifficulty = currentQuestion?.difficulty || meta?.current_difficulty || "medium";
  const currentCitation = currentQuestion?.source || meta?.sourceFilename || "Uploaded slides";
  const correctOptionDetails =
    showResult && resultSummary
      ? currentQuestion.options.find((opt) => opt.id === resultSummary.correctAnswer)
      : null;

  const handleAnswerSelect = (optionId) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const goToQuestion = (index) => {
    const clamped = Math.max(0, Math.min(index, Math.max(questions.length - 1, 0)));
    setShowResult(false);
    setResultSummary(null);
    setSelectedAnswer(null);
    router.push(`/Quiz/${clamped + 1}`);
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

    if (questionIndex === questions.length - 1) {
      appendQuestion(selectedDifficulty);
    }
    setIsSubmitting(false);
    setShowResult(true);
    setResultSummary({
      isCorrect,
      selectedAnswer,
      correctAnswer: question.correctOption,
    });
  };

  const handlePreviousQuestion = () => {
    if (questionIndex === 0) return;
    goToQuestion(questionIndex - 1);
  };

  const handleNextQuestion = () => {
    if (questionIndex >= questions.length - 1) return;
    goToQuestion(questionIndex + 1);
  };

  const handleReturnToConfig = () => {
    const target = meta.mode === "practice" ? "/Instructor/Practice" : "/Instructor/Assessment";
    try {
      if (typeof window !== "undefined") {
        const seed = safeParse(localStorage.getItem("quizGeneratorSeed")) || {};
        if (meta.mode === "practice") {
          const draft = {
            mode: "practice",
            title: meta?.title ?? "",
            description: meta?.description ?? "",
            topics: Array.isArray(meta?.topicsToTest) ? meta.topicsToTest : [],
            id: meta?.id ?? meta?.quizId ?? null,
            sourceFilename: meta?.sourceFilename ?? seed.filename ?? "",
            documentId: meta?.documentId ?? seed.documentId ?? null,
            isPublished: Boolean(meta?.isPublished),
          };
          localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
        } else {
          const configuration = meta?.configuration ?? {};
          const draft = {
            mode: "assessment",
            id: meta?.quizId ?? meta?.id ?? null,
            sourceFilename: meta?.sourceFilename ?? seed.filename ?? "",
            documentId: meta?.documentId ?? seed.documentId ?? null,
            configuration,
            isPublished: Boolean(meta?.isPublished),
          };
          localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
        }
      }
    } catch (error) {
      console.error("Unable to persist configuration draft before returning", error);
    } finally {
      router.push(target);
    }
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

  const modeLabel = meta.mode === "practice" ? "Practice" : "Assessment";

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReturnToConfig}
            className={`text-base text-purple-700 hover:text-purple-900 font-semibold ${poppins.className}`}
            >
              ← Back to Configuration
            </button>
          </div>
        <div className="mb-6">
          <h2 className={`text-lg font-bold text-purple-900 ${poppins.className}`}>
            {modeLabel} Quiz Preview · Question {questionIndex + 1} / {questions.length}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-3 text-base md:grid-cols-3 text-gray-700">
            <div>
              <span className="font-semibold text-gray-700">Current difficulty:</span>{" "}
              <span className="capitalize">{currentDifficulty}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Topic:</span> {currentTopic}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Source:</span> {currentCitation}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className={`text-2xl font-bold text-purple-900 mb-6 ${poppins.className}`}>
              {currentQuestion.prompt}
            </h1>
            <div className="mb-8" />
            {showResult && resultSummary && (
              <div className="mb-8 rounded-2xl border border-purple-200 bg-purple-50 p-4">
                <p
                  className={`text-base font-semibold ${
                    resultSummary.isCorrect ? "text-green-700" : "text-red-600"
                  } ${poppins.className}`}
                >
                  {resultSummary.isCorrect
                    ? "Correct — nice work!"
                    : "Not quite — review the explanations below."}
                </p>
                <p className={`mt-1 text-sm text-purple-900 ${poppins.className}`}>
                  Correct answer:{" "}
                  <span className="font-semibold">
                    {resultSummary.correctAnswer}
                    {correctOptionDetails ? ` — ${correctOptionDetails.text}` : ""}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOption = currentQuestion.correctOption === option.id;
                const showFeedback = showResult;
                const baseClasses = showFeedback
                  ? isCorrectOption
                    ? "bg-green-50 border-2 border-green-500"
                    : isSelected
                      ? "bg-red-50 border-2 border-red-400"
                      : "bg-gray-100 border border-gray-300"
                  : isSelected
                    ? "bg-purple-200 border-2 border-purple-600"
                    : "bg-gray-100 border border-gray-300 hover:bg-gray-200";

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-200 ${baseClasses} ${poppins.className}`}
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
                    {showFeedback && (
                      <p
                        className={`mt-2 text-sm ${
                          isCorrectOption
                            ? "text-green-700"
                            : isSelected
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        {option.reason ||
                          (isCorrectOption
                            ? "This choice is correct."
                            : "This choice is not correct.")}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className={`text-sm text-gray-600 ${poppins.className}`}>
              Next question difficulty:
            </label>
            <select
              value={selectedDifficulty}
              onChange={handleDifficultyChange}
              className={`px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${poppins.className}`}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={questionIndex === 0}
              className={`px-5 py-2 rounded-lg border border-purple-400 text-purple-700 font-medium transition-all duration-300 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed ${poppins.className}`}
            >
              Previous Question
            </button>
            {questionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className={`px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium transition-all duration-300 hover:bg-gray-100 ${poppins.className}`}
              >
                Next Question
              </button>
            )}
            {questionIndex === questions.length - 1 && (
              <button
                onClick={showResult ? () => goToQuestion(questionIndex + 1) : handleSubmit}
                disabled={!selectedAnswer && !showResult}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${poppins.className}`}
                style={{
                  background: "linear-gradient(to right, #EC4899, #F97316)",
                }}
              >
                {showResult ? "Next Question" : isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
  const handleDifficultyChange = (event) => {
    setSelectedDifficulty(event.target.value);
  };
