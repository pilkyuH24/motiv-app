// components/profile/ProfileSection.tsx
import { ProfileSectionProps } from "@/types/profile";

export const ProfileSection = ({ title, children }: ProfileSectionProps) => (
  <div className="p-4 border rounded-lg shadow mb-4 text-xl">
    {title && <h2 className="font-semibold mb-2">{title}</h2>}
    {children}
  </div>
);

