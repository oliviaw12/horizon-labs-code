"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function QuizGeneratorPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState("assessment");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleNext = () => {
    // Persist placeholder metadata so downstream pages can use it.
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "quizGeneratorSeed",
          JSON.stringify({
            mode: selectedMode,
            filename: uploadedFile?.name ?? "sample-notes.pdf",
            createdAt: new Date().toISOString(),
          })
        );
      }
    } catch (error) {
      console.error("Unable to persist quiz generator seed", error);
    }

    if (selectedMode === "assessment") {
      router.push("/Instructor/Assessment");
    } else {
      router.push("/Instructor/Practice");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12">
      {/* Graduation Cap Icon */}
      <img src="/logo1.png" alt="Graduation Cap" className="w-208px h-200px"/>

      {/* Main Title */}
      <h1 className={`text-5xl font-bold text-purple-900 mb-4 text-center ${poppins.className}`}>
        Create a New Quiz
      </h1>

      {/* Subtitle */}
      <p className={`text-lg text-gray-600 mb-8 text-center ${poppins.className}`}>
        Select a mode
      </p>

      {/* Mode Selection Buttons */}
      <div className="flex gap-6 mb-12">
        <button
          onClick={() => handleModeSelect("assessment")}
          className={`px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
            selectedMode === "assessment"
              ? "ring-4 ring-offset-2 ring-purple-300"
              : ""
          } ${poppins.className}`}
          style={{
            background: "linear-gradient(to right, #EC4899, #7B2CBF)",
          }}
        >
          Assessment
        </button>
        <button
          onClick={() => handleModeSelect("practice")}
          className={`px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
            selectedMode === "practice"
              ? "ring-4 ring-offset-2 ring-orange-300"
              : ""
          } ${poppins.className}`}
          style={{
            background: "linear-gradient(to right, #FF6B35, #F97316)",
          }}
        >
          Practice
        </button>
      </div>

      {/* Upload Button */}
      <div className="mb-4 w-full max-w-md">
        <label htmlFor="file-upload">
          <div
            className="rounded-xl p-[2px] cursor-pointer transition-all duration-300 hover:shadow-lg"
            style={{
              background: "linear-gradient(to right, #7B2CBF, #9333EA)",
            }}
          >
            <div className="bg-white rounded-[10px] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Upload Icon */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15V3M12 3L8 7M12 3L16 7"
                    stroke="#7B2CBF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19V17"
                    stroke="#7B2CBF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={`text-lg font-medium text-purple-900 ${poppins.className}`}
                >
                  {uploadedFile ? uploadedFile.name : "Upload Slides/Notes"}
                </span>
              </div>
            </div>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.pptx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* File Format Info */}
      <p className={`text-sm text-gray-600 mb-12 ${poppins.className}`}>
        Supports PDF/PPTX
      </p>

      {/* Next Button */}
      <button
          onClick={handleNext}
          disabled={!selectedMode}
        className={`px-12 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${poppins.className}`}
        style={{
          background:
            selectedMode
              ? "linear-gradient(to right, #7B2CBF, #3B82F6)"
              : "linear-gradient(to right, #9CA3AF, #6B7280)",
        }}
      >
        Next
      </button>
    </div>
  );
}
