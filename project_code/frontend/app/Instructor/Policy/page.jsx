"use client";

import { useState, useRef } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PolicyPage() {
  const router = useRouter();
  const [frictionLevel, setFrictionLevel] = useState(1);
  const [showFrictionDropdown, setShowFrictionDropdown] = useState(false);
  const [checkDifficulty, setCheckDifficulty] = useState(50);
  const [focusFiles, setFocusFiles] = useState([]);
  const [denyFiles, setDenyFiles] = useState([]);
  const [selectedFocusFiles, setSelectedFocusFiles] = useState(new Set());
  const [selectedDenyFiles, setSelectedDenyFiles] = useState(new Set());
  
  const focusFileInputRef = useRef(null);
  const denyFileInputRef = useRef(null);

  const frictionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleFrictionSelect = (level) => {
    setFrictionLevel(level);
    setShowFrictionDropdown(false);
  };

  const handleFocusFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        file: file,
      };
      setFocusFiles([...focusFiles, newFile]);
      setSelectedFocusFiles(new Set([...selectedFocusFiles, newFile.id]));
    }
    if (focusFileInputRef.current) {
      focusFileInputRef.current.value = "";
    }
  };

  const handleDenyFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        file: file,
      };
      setDenyFiles([...denyFiles, newFile]);
      setSelectedDenyFiles(new Set([...selectedDenyFiles, newFile.id]));
    }
    if (denyFileInputRef.current) {
      denyFileInputRef.current.value = "";
    }
  };

  const handleFocusFileToggle = (fileId) => {
    const newSelected = new Set(selectedFocusFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFocusFiles(newSelected);
  };

  const handleDenyFileToggle = (fileId) => {
    const newSelected = new Set(selectedDenyFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedDenyFiles(newSelected);
  };

  const handleRunTestPrompt = () => {
    router.push("/Instructor/Policy/Test");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="flex h-full min-h-screen flex-col xl:flex-row">
        {/* left border line */}
        <div className="hidden xl:block w-80 bg-white border-r border-[#9690B7] relative z-10" />

        {/* Main Content Area */}
        <div className="flex-1 bg-white relative z-10">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col px-6 py-10 sm:px-10 lg:px-16">
            <div className="flex flex-col max-w-4xl pt-10 sm:pt-12 lg:pt-16">
              <div className="mb-8 sm:mb-10">
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 ${poppins.className}`}
                >
                  Policy & Services
                </h1>
                <p
                  className={`text-base sm:text-lg text-gray-500 ${poppins.className}`}
                  style={{ marginLeft: 5, paddingLeft: 0 }}
                >
                  Configure friction levels and content scope settings
                </p>
              </div>

              <div className="space-y-8">
                {/* Friction Level Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
                  <h2
                    className={`text-xl sm:text-2xl font-bold text-gray-900 mb-4 ${poppins.className}`}
                  >
                    Friction Level
                  </h2>
                  <p
                    className={`text-sm text-gray-600 mb-4 ${poppins.className}`}
                  >
                    Minimum checks before answer
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => setShowFrictionDropdown(!showFrictionDropdown)}
                      className="w-full sm:w-64 flex items-center justify-between px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl hover:border-green-400 transition-colors"
                    >
                      <span className={`text-base font-medium text-gray-900 ${poppins.className}`}>
                        {frictionLevel}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          showFrictionDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {showFrictionDropdown && (
                      <div className="absolute z-20 w-full sm:w-64 mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {frictionOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleFrictionSelect(option)}
                            className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                              frictionLevel === option ? "bg-green-100" : ""
                            }`}
                          >
                            <span className={`text-base font-medium text-gray-900 ${poppins.className}`}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Check Difficulty Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
                  <h2
                    className={`text-xl sm:text-2xl font-bold text-gray-900 mb-4 ${poppins.className}`}
                  >
                    Difficulty of Making Checks
                  </h2>
                  <p
                    className={`text-sm text-gray-600 mb-4 ${poppins.className}`}
                  >
                    Adjust the difficulty level (0-100)
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={checkDifficulty}
                        onChange={(e) => setCheckDifficulty(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${checkDifficulty}%, #e5e7eb ${checkDifficulty}%, #e5e7eb 100%)`,
                        }}
                      />
                      <span
                        className={`text-lg font-semibold text-gray-900 min-w-[3rem] text-right ${poppins.className}`}
                      >
                        {checkDifficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Scope Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
                  <h2
                    className={`text-xl sm:text-2xl font-bold text-gray-900 mb-6 ${poppins.className}`}
                  >
                    Content Scope
                  </h2>

                  {/* Focus Section */}
                  <div className="mb-8">
                    <h3
                      className={`text-lg font-semibold text-gray-800 mb-4 ${poppins.className}`}
                    >
                      Focus Section
                    </h3>
                    <div className="space-y-3 mb-4">
                      {focusFiles.length > 0 ? (
                        focusFiles.map((file) => (
                          <label
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFocusFiles.has(file.id)}
                              onChange={() => handleFocusFileToggle(file.id)}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className={`text-sm text-gray-700 flex-1 ${poppins.className}`}>
                              {file.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className={`text-sm text-gray-500 ${poppins.className}`}>
                          No files uploaded yet
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => focusFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-300 rounded-xl hover:bg-green-100 hover:border-green-400 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className={`text-sm font-medium text-green-700 ${poppins.className}`}>
                        Upload File
                      </span>
                    </button>
                    <input
                      ref={focusFileInputRef}
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      onChange={handleFocusFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Deny Section */}
                  <div>
                    <h3
                      className={`text-lg font-semibold text-gray-800 mb-4 ${poppins.className}`}
                    >
                      Deny Section
                    </h3>
                    <div className="space-y-3 mb-4">
                      {denyFiles.length > 0 ? (
                        denyFiles.map((file) => (
                          <label
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDenyFiles.has(file.id)}
                              onChange={() => handleDenyFileToggle(file.id)}
                              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className={`text-sm text-gray-700 flex-1 ${poppins.className}`}>
                              {file.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className={`text-sm text-gray-500 ${poppins.className}`}>
                          No files uploaded yet
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => denyFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-300 rounded-xl hover:bg-red-100 hover:border-red-400 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className={`text-sm font-medium text-red-700 ${poppins.className}`}>
                        Upload File
                      </span>
                    </button>
                    <input
                      ref={denyFileInputRef}
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      onChange={handleDenyFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Run Test Prompt Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleRunTestPrompt}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className={poppins.className}>Run Test Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Right Panel */}
        <div className="hidden lg:block lg:w-40 xl:w-72 2xl:w-80 bg-purple-100 border-l border-gray-300 relative z-20" />
      </div>

      {/* Gradients */}
      <img src="/gradient1.png" alt="Gradient decoration" className="fixed bottom-0 left-0 w-40 sm:w-56 lg:w-72 z-20" />

      {/* Click outside to close dropdown */}
      {showFrictionDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFrictionDropdown(false)}
        />
      )}
    </div>
  );
}

