// types/badge-ui.ts
import { Badge } from "./badge";

/**
 * 프로필 페이지 내부 섹션 UI에 사용되는 공통 컴포넌트의 props
 * 예: "Earned Badges", "Basic Info" 등 섹션 블록 타이틀과 내용
 */
export interface ProfileSectionProps {
  title?: string;             // 섹션 제목 (optional)
  children: React.ReactNode;  // 섹션 내부에 들어갈 컴포넌트 또는 텍스트
}

/**
 * 프로필 페이지에서 유저가 획득한 뱃지 목록을 렌더링할 때 사용되는 props
 * - isLoading: 뱃지 데이터를 비동기로 불러오는 동안 로딩 상태를 나타냄
 */
export interface BadgesListProps {
  badges: Badge[];        // 표시할 뱃지 배열
  isLoading?: boolean;    // 뱃지 데이터를 가져오는 중일 때 true
}

/**
 * 뱃지 획득 시 표시되는 BadgeModal의 props
 * - earnedBadges: 새로 획득한 뱃지들
 * - onClose: 사용자가 모달을 닫을 때 실행되는 콜백
 */
export interface BadgeModalProps {
  badges: Badge[];       // 새로 획득한 뱃지 목록
  onClose: () => void;   // 모달 닫기 콜백 함수
}
