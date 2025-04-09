// types/profile.ts
export interface Badge {
    title: string;
    description: string;
  }
  
  export interface ProfileSectionProps {
    title?: string;
    children: React.ReactNode;
  }
  
  export interface BadgesListProps {
    badges: Badge[];
    isLoading?: boolean;
  }