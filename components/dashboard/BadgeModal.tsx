//components/dashboard/BadgeModal
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Badge {
  id: number;
  title: string;
  description: string | null;
  rank?: number;
}

interface BadgeModalProps {
  badges: Badge[];
  onClose: () => void;
}

export default function BadgeModal({ badges, onClose }: BadgeModalProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [animation, setAnimation] = useState("scale-0");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Run after component is mounted
    setMounted(true);
    
    // Start open animation
    setTimeout(() => {
      setAnimation("scale-100");
    }, 10);

    runConfetti();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    // Prevent background from scrolling when modal is open
    document.body.style.overflow = 'hidden';

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = (e?: React.MouseEvent) => {
    // If an event is passed, prevent default behavior and stop propagation
    // → e.preventDefault()는 버튼 클릭 시 브라우저의 기본 동작(예: form submit)을 막고,
    //    e.stopPropagation()은 부모 요소로 이벤트가 전파되는 것을 막아줍니다.
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setAnimation("scale-0");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
      runConfetti();
    } else {
      handleClose();
    }
  };

  const currentBadge = badges[currentBadgeIndex];

  // Simple confetti animation using DOM elements
  function runConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const containerDiv = document.createElement('div');
    containerDiv.style.position = 'fixed';
    containerDiv.style.top = '0';
    containerDiv.style.left = '0';
    containerDiv.style.width = '100%';
    containerDiv.style.height = '100%';
    containerDiv.style.pointerEvents = 'none';
    containerDiv.style.zIndex = '200000'; // 임시: zIndex에 임의 큰수
    document.body.appendChild(containerDiv);

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 5 + 5}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.borderRadius = `${Math.random() > 0.5 ? '50%' : '0'}`;

        containerDiv.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        confetti.animate(
          [
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
          ],
          {
            duration: duration * 1000,
            easing: 'linear',
            fill: 'forwards'
          }
        );

        setTimeout(() => {
          confetti.remove();
        }, duration * 1000);
      }, Math.random() * 1000);
    }

    setTimeout(() => {
      containerDiv.remove();
    }, 5000);
  }

  // Modal content to be rendered
  const modalContent = (
    // These styles override global styles to ensure full-screen modal
    // createPortal 설명:
    // → createPortal은 React 컴포넌트를 현재 DOM 트리와는 별개의 위치(보통 document.body)에 렌더링할 수 있게 해줍니다.
    //    이 모달처럼 화면 위에 떠야 하는 컴포넌트는 z-index를 포함한 위치 제어가 중요하므로 Portal을 통해 분리 렌더링하는 것이 적절합니다.
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 100000, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        // Close modal when background is clicked, but not when modal itself is clicked
        // → 모달 바깥을 클릭하면 닫히고, 내부 요소 클릭은 전파 중지로 막아줌
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className={`bg-gradient-to-br from-indigo-400 to-pink-300 p-8 rounded-2xl shadow-2xl max-w-md w-full text-white transition-transform duration-300 ease-out relative`}
        style={{ transform: animation === 'scale-0' ? 'scale(0)' : 'scale(1)' }}
      >
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          onClick={(e) => handleClose(e)}
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <div className="text-yellow-300 text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">Badge Earned!</h2>
          <div className="h-1 w-16 bg-yellow-300 mx-auto rounded-full mb-6"></div>
          
          <h3 className="text-2xl font-bold mb-2">{currentBadge.title}</h3>
          {currentBadge.rank && (
            <div className="bg-yellow-400/60 inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3">
              {currentBadge.rank === 1 ? "S Tier" : 
               currentBadge.rank === 2 ? "A Tier" : 
               currentBadge.rank === 3 ? "B Tier" : "C Tier"}
            </div>
          )}
          <p className="text-white/90 mb-6">{currentBadge.description}</p>
          
          {badges.length > 1 && (
            <div className="flex justify-center gap-2 mb-6">
              {badges.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 w-2 rounded-full ${
                    index === currentBadgeIndex ? "bg-yellow-300" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          className="w-full py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-yellow-300/90 transition-colors"
          onClick={handleNext}
          type="button"
        >
          {currentBadgeIndex < badges.length - 1 ? "Next Badge" : "Close"}
        </button>
      </div>
    </div>
  );

  // Avoid rendering until component is mounted
  if (!mounted) return null;

  // Render modal directly into the document body using portal
  return createPortal(modalContent, document.body);
}
