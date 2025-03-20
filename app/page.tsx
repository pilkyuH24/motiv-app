"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LoginButton } from "./components/auth";
import "./home.css";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const sections = [
  { id: "section1", title: "Select Your Missions" },
  { id: "section3", title: "Mission Calendar" },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Home() {
  const { data: session, status } = useSession();

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
              <h1 className="animated-text text-4xl md:text-5xl lg:text-8xl font-bold">
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
        <nav className="animated-navbar bg-[#fbd4c5]/50 backdrop-blur-md shadow-lg p-4 flex px-10 md:px-40 lg:px-80 justify-between z-50">
          {sections.map(({ id, title }) => (
            <button
              key={id}
              className="text-white text-2xl"
              onClick={() => scrollToSection(id)}
            >
              {title}
            </button>
          ))}
        </nav>

        {/* Glassmorphism Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-20 py-12 bg-gradient-to-br from-[#fbd4c5] to-[#a2d2ff] text-gray-700 text-2xl">
  {/* Section 1: Mission Selection */}
  <div
    id="section1"
    className="h-120 bg-white/30 backdrop-blur-lg shadow-lg rounded-xl flex flex-col items-center justify-center text-2xl font-semibold border border-white/40 p-6 opacity-90"
  >
    <p className="mb-4 text-center">
      <span className="underline decoration-[#f78ca0] decoration-4">
        Choose multiple missions
      </span>
      <br />
      Customize your challenge by setting specific dates and repeating schedules.
    </p>
    <ul className="text-lg opacity-80 list-disc text-left pl-6">
      <li>Set daily, weekly, or custom schedules.</li>
      <li>Track mission progress easily.</li>
      <li>Stay committed with reminders.</li>
    </ul>
  </div>

  {/* Section 2: Mission Recommendations */}
  <div
    id="section2"
    className="h-120 bg-white/30 backdrop-blur-lg shadow-lg rounded-xl flex flex-col items-center justify-center text-2xl font-semibold border border-white/40 p-6 opacity-90"
  >
    <p className="mb-4 text-center">
      <span className="underline decoration-[#ffafcc] decoration-4">
        Personalized Mission Suggestions
      </span>
      <br />
      Based on your preferences and past performance.
    </p>
    <ul className="text-lg opacity-80 list-disc text-left pl-6">
      <li>AI-driven recommendations for better results.</li>
      <li>Suggestions based on your selected categories.</li>
      <li>Stay motivated with fresh challenges.</li>
    </ul>
  </div>

  {/* Section 3: Mission Calendar */}
  <div
    id="section3"
    className="h-120 bg-white/30 backdrop-blur-lg shadow-lg rounded-xl flex flex-col items-center justify-center text-2xl font-semibold border border-white/40 p-6 opacity-90"
  >
    <p className="mb-4 text-center">
      <span className="underline decoration-[#9d76c1] decoration-4">
        Track Your Progress
      </span>
      <br />
      View your mission success summary on an interactive calendar.
    </p>
    <ul className="text-lg opacity-80 list-disc text-left pl-6">
      <li>Check your completed missions at a glance.</li>
      <li>Identify trends in your mission streaks.</li>
      <li>Celebrate your consistency and achievements.</li>
    </ul>
  </div>

  {/* Section 4: Achievements and Rewards */}
  <div
    id="section4"
    className="h-120 bg-white/30 backdrop-blur-lg shadow-lg rounded-xl flex flex-col items-center justify-center text-2xl font-semibold border border-white/40 p-6 opacity-90"
  >
    <p className="mb-4 text-center">
      <span className="underline decoration-[#ffcb77] decoration-4">
        Earn Badges & Rewards
      </span>
      <br />
      Get recognized for your dedication and hard work.
    </p>
    <ul className="text-lg opacity-80 list-disc text-left pl-6">
      <li>Unlock achievements as you complete missions.</li>
      <li>Gain points and exchange them for exclusive rewards.</li>
      <li>Stay inspired with milestone-based incentives.</li>
    </ul>
  </div>
</section>


        {/* Footer */}
        <footer className=".animated-footer w-full bg-[#a2d2ff] text-white backdrop-blur-lg text-base py-2 px-15 mt-auto">
          Pilkyu Han
        </footer>
      </div>
    </main>
  );
}
