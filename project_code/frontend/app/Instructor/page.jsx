"use client";

import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function InstructorPage() {
  const router = useRouter();

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleQuizGenerator = () => {
    router.push("/Instructor/QuizGenerator");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="flex h-screen">
        {/* left border line */}
        <div className="w-80 bg-white border-r border-[#9690B7] relative z-10"/>
        {/* Main Content Area (White) */}
        <div className="flex-1 bg-white relative z-10">
          <div className="h-full flex flex-col p-8">
            {/* Top Section */}
            <div className="flex-1">

              {/* Welcome Section */}
              <div className="ml-2 mb-6">
                <h1 className={`text-5xl font-bold text-gray-900 mb-2 ${poppins.className}`}>
                  Welcome Instructor
                </h1>
                <p className={`text-lg text-gray-500 ${poppins.className}`} style={{ marginLeft: 5, paddingLeft: 0 }}>
                  {formattedDate}
                </p>
              </div>

              {/* Quiz Generator Button */}
              <div className="ml-2">
                <button
                  onClick={handleQuizGenerator}
                  className="relative inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Speech Bubble Icon with Question Mark */}
                  <div className="flex items-center justify-center bg-white/20 rounded-lg p-1">
                    <img
                        src="/QuizQ.png"
                        alt="Quiz Bubble"
                        className="w-6 h-6"
                    />
                  </div>
                  <span className={poppins.className}>Quiz Generator</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel (Light Purple) */}
      <div className="fixed top-0 right-0 w-80 h-screen bg-purple-100 border-l border-gray-300 z-20">
      </div>
      {/* left Bottom Gradient */}
      <img src="/gradient1.png" alt="Gradient decoration" className="fixed bottom-0 left-0 z-20" />
    </div>
  );
}

