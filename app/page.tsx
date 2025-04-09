"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LoginButton } from "@/components/ui/logInOutBtn";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

const sections = [
  { id: "section1", title: "Select Your Missions" },
  { id: "section3", title: "Mission Calendar" },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Home() {
  const { status } = useSession();

  if (status === "authenticated") {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#fbd4c5]">
      <div className="h-[100vh] overflow-auto">
        {/* Hero Section with Lottie Animation */}
        <section className="relative w-full min-h-[80vh] bg-[#fbd4c5] flex items-center justify-center px-20">
          {/* Login Button - Top Right of Hero */}
          <div className="absolute top-4 right-4">
            <LoginButton />
          </div>

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-5 items-center text-end">
            {/* Left: Hero Text */}
            <div className="w-full">
              <h1 className="animated-text text-4xl lg:text-5xl lg:text-8xl font-bold">
                🚀 Achievement Unlocked: <br /> Master of Daily Quests
              </h1>
            </div>

            {/* Right: Lottie Animation */}
            <div className="w-[400px] h-[400px]">
              <DotLottieReact
                src="https://lottie.host/c35c6264-079b-4a3a-aad5-8acbbd690f78/ggfPsUqir2.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </section>

        {/* Glassmorphism Sticky Navbar */}
        <nav className="animated-navbar bg-[#fbd4c5]/50 backdrop-blur-md shadow-lg p-4 flex px-10 md:px-40 lg:px-80 justify-center z-50">
          <div className="text-white text-2xl font-semibold">
            Transform Daily Tasks into Epic Adventures
          </div>
        </nav>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 lg:p-12 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-gray-800">
          {/* text card 1 */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 rounded-2xl shadow-xl p-8 h-full transform hover:scale-[1.02] transition-all duration-300 border border-white/50">
              <h3 className="text-2xl lg:text-3xl font-extrabold mb-5 text-center leading-tight">
                <span className="relative inline-block">
                  Track Your Progress
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-300 opacity-70 rounded-full"></span>
                </span>
              </h3>

              <p className="mb-6 text-lg text-center text-gray-700 leading-relaxed">
                Stay on top of your goals with a clear and intuitive view of
                your daily mission progress.
              </p>

              <ul className="flex flex-col items-center space-y-4 text-base lg:text-lg text-gray-800">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-3 text-xl">•</span>
                  Instantly see which missions you’ve completed today.
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-3 text-xl">•</span>
                  Visualize your streaks and identify trends over time.
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-3 text-xl">•</span>
                  Filter progress by date, mission type, or tag.
                </li>
              </ul>
            </div>
          </div>

          {/* video card - Dashboard (hidden) */}
          <div className="col-span-1 row-span-2 hidden lg:flex">
            <div className="bg-white/1 rounded-2xl p-4 h-full flex items-center justify-center overflow-hidden transform hover:scale-102 transition-all duration-300 ">
              <div className="w-full rounded-lg overflow-hidden">
                <video
                  className="w-full h-full object-contain mx-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="dashboard_mov.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* video card - Calendar (hidden) */}
          <div className="col-span-1 hidden lg:flex">
            <div className="bg-white/1 rounded-2xl p-4 h-full flex items-center justify-center overflow-hidden transform hover:scale-102 transition-all duration-300 ">
              <div className="w-full rounded-lg overflow-hidden">
                <video
                  className="w-full object-contain mx-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="calendar_mov.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* text card 2 */}
          <div className="col-span-1">
            <div className="bg-white/70 rounded-2xl shadow-xl p-8 h-full transform hover:scale-[1.02] transition-all duration-300 border border-white/50">
              <h3 className="text-2xl lg:text-3xl font-extrabold mb-5 text-center leading-tight">
                <span className="relative inline-block">
                  Earn Rewards & Achievements
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-pink-300 opacity-70 rounded-full"></span>
                </span>
              </h3>

              <p className="mt-12 mb-6 text-lg text-center text-gray-700 leading-relaxed">
                Get recognized for your dedication and consistency with badges.
              </p>

              <ul className="space-y-4 text-base lg:text-lg text-gray-800">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">•</span>
                  Unlock badges as you complete missions and build habits.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">•</span>
                  Level up by maintaining streaks and completing challenges.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">•</span>
                  View your achievement history and share your progress.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-sky-300 text-white backdrop-blur-lg text-base py-2 px-15 mt-auto flex justify-end">
          <Link
            href="https://github.com/pilkyuH24/motiv-app"
            className="underline"
          >
            Github link
          </Link>
          <div className="ml-4">@Pilkyu Han</div>
        </footer>
      </div>
    </main>
  );
}
