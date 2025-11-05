"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PracticePage() {
  const router = useRouter();
  const [topicsToTest, setTopicsToTest] = useState("");

  const SAMPLE_QUESTIONS = [
    {
      id: "q1",
      prompt: "Which JavaScript method converts a JSON string into an object?",
      options: [
        { id: "A", text: "JSON.stringify" },
        { id: "B", text: "JSON.parse" },
        { id: "C", text: "Object.assign" },
        { id: "D", text: "JSON.object" },
      ],
      correctOption: "B",
      explanation: "JSON.parse converts a JSON-formatted string into a JavaScript object.",
    },
    {
      id: "q2",
      prompt: "What CSS property controls the spacing between lines of text?",
      options: [
        { id: "A", text: "letter-spacing" },
        { id: "B", text: "line-height" },
        { id: "C", text: "text-indent" },
        { id: "D", text: "word-spacing" },
      ],
      correctOption: "B",
      explanation: "The line-height property specifies the amount of space between lines.",
    },
    {
      id: "q3",
      prompt: "Which HTTP status code indicates that a resource was not found?",
      options: [
        { id: "A", text: "200" },
        { id: "B", text: "301" },
        { id: "C", text: "404" },
        { id: "D", text: "500" },
      ],
      correctOption: "C",
      explanation: "404 Not Found indicates that the server can't locate the requested resource.",
    },
  ];

  const handleInputChange = (e) => {
    setTopicsToTest(e.target.value);
  };

  const persistPreviewAndNavigate = (payload) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("quizPreviewData", JSON.stringify(payload));
        localStorage.setItem("quizPreviewQuestions", JSON.stringify(SAMPLE_QUESTIONS));
        localStorage.removeItem("quizPreviewResponses");
        localStorage.setItem("currentQuizId", "preview-practice");
      }
    } catch (error) {
      console.error("Unable to persist preview payload", error);
    }
    router.push("/Quiz/1");
  };

  const handlePreviewQuiz = () => {
    persistPreviewAndNavigate({
      mode: "practice",
      topicsToTest: topicsToTest.trim(),
    });
  };

  const handlePublishQuiz = () => {
    console.log("Publish Quiz:", topicsToTest.trim());
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold text-purple-900 mb-2 ${poppins.className}`}
          >
            Practice Mode
          </h1>
          <p className={`text-base text-gray-600 ${poppins.className}`}>
            Unlimited questions for students to practice and prep for assessments.
          </p>
        </div>

        {/* Topic Configuration Section */}
        <div className="mb-8">
          <h2
            className={`text-2xl font-bold text-purple-900 mb-4 ${poppins.className}`}
          >
            Topic Configuration
          </h2>
          <div>
            <label
              htmlFor="topicsToTest"
              className={`block text-sm font-medium text-gray-600 mb-2 ${poppins.className}`}
            >
              Topics to Test
            </label>
            <textarea
              id="topicsToTest"
              name="topicsToTest"
              value={topicsToTest}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-4 py-3 border border-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${poppins.className}`}
              placeholder="Enter topics separated by commas or line breaks"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {/* Preview Quiz Button */}
          <button
            onClick={handlePreviewQuiz}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
            style={{
              background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
            }}
          >
            {/* Play Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.66667 4.16667L15 10L6.66667 15.8333V4.16667Z"
                fill="white"
              />
            </svg>
            Preview Quiz
          </button>

          {/* Publish Quiz Button */}
          <button
            onClick={handlePublishQuiz}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${poppins.className}`}
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
