// types/badge-ui.ts
import { Badge } from "./badge";

export interface ProfileSectionProps {
  title?: string;
  children: React.ReactNode;
}

export interface BadgesListProps {
  badges: Badge[];
  isLoading?: boolean;
}

export interface BadgeModalProps {
  badges: Badge[];
  onClose: () => void;
}
