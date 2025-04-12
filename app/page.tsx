"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LoginButton } from "@/components/ui/logInOutBtn";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

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

        <nav className="bg-gradient-to-r from-[#f8b195] via-[#f67280] to-[#c06c84] shadow-lg p-4 flex px-10 md:px-40 lg:px-80 justify-center z-50">
          <div className="text-white text-2xl font-semibold">
            Transform Daily Tasks into Epic Adventures
          </div>
        </nav>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:pb-36 lg:pt-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 text-gray-800 rounded-xl ">
          <div className="lg:col-span-1">
            {/* 데모 안내 문구 */}
            <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-5 rounded-xl mb-6 shadow-sm">
              <p className="text-base lg:text-lg font-semibold flex items-center">
                <span className="mr-2">⚠️</span> 현재 페이지는{" "}
                <span className="mx-1 bg-amber-200 px-2 py-0.5 rounded-md">
                  데모 버전
                </span>
                입니다.
              </p>
              <ul className="mt-3 space-y-2 text-sm lg:text-base list-disc list-inside">
                <li>
                  <span className="font-medium">Missions</span> 페이지에서
                  새로운 미션을 추가할 수 있습니다. 현재 시간은{" "}
                  <span className="font-medium">UTC 기준</span>으로 저장되고
                  표시됩니다.
                </li>
                <li>
                  하루짜리 미션을 생성하고 완료하면{" "}
                  <span className="font-medium">뱃지 모달</span>을 테스트할 수
                  있습니다.
                </li>
                <li>
                  <span className="font-medium">Dashboard</span>에서 캘린더의
                  날짜나 특정 미션을 클릭하면 해당 로그 정보를 확인할 수
                  있습니다.
                </li>
                <li>
                  <span className="font-medium">Profile</span> 페이지에서 계정을
                  삭제할 수 있으며, 이 경우{" "}
                  <span className="font-medium">
                    모든 관련 데이터가 완전히 삭제
                  </span>
                  됩니다.
                </li>
                <li>
                  본 앱은 테스트용으로 운영되며,{" "}
                  <span className="font-medium">DB가 수시로 초기화</span>될 수
                  있습니다.
                </li>
              </ul>
            </div>

            <div className="lg:mt-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 h-fit border border-white/50">
              <h3 className="text-2xl lg:text-3xl font-extrabold mb-5 text-center leading-tight">
                <span className="relative inline-block">
                  Keep Going, Every Day
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-300 opacity-70 rounded-full"></span>
                </span>
              </h3>

              <p className="mb-6 text-lg text-center text-gray-700 leading-relaxed">
                작은 목표부터 차근차근. 매일 한 걸음씩 꾸준히 나아가며 당신의
                성장을 눈으로 확인해보세요.
              </p>

              <ul className="space-y-4 text-base lg:text-lg text-gray-800">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    •
                  </span>
                  <span>오늘의 미션을 완료하고 체크하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    •
                  </span>
                  <span>연속 성공일을 확인하고 꾸준함을 이어가세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    •
                  </span>
                  <span>매일의 작은 실천이 좋은 습관이 됩니다.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 lg:mt-36">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col lg:flex-row gap-8 items-center justify-between overflow-hidden shadow-lg border border-white/30">
              <div className="lg:w-1/3 text-gray-800">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                    📊
                  </span>
                  대시보드를 활용해보세요
                </h3>
                <p className="text-lg leading-relaxed mb-5">
                  매일의 미션 진행 상태를 한 눈에 확인할 수 있는 대시보드.{" "}
                  <br className="hidden lg:block" />
                  날짜별로 완료 여부를 확인하고, 특정 미션의 상세 로그도 클릭 한
                  번으로 볼 수 있어요.
                </p>
                <ul className="space-y-2 text-base">
                  <li className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-3"></span>
                    캘린더 기반 시각화
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-3"></span>
                    진행 중 미션 빠르게 확인
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-3"></span>
                    미션 조작 및 삭제 지원
                  </li>
                </ul>
              </div>

              <div className="lg:w-2/3 w-full rounded-xl overflow-hidden shadow-md border-4 border-white/50">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="dashboard_mov2.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-gradient-to-r from-[#f8b195] via-[#f67280] to-[#c06c84] text-white backdrop-blur-lg text-base py-2 px-15 mt-auto flex justify-end">
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
