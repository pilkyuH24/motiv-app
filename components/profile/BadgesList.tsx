// components/profile/BadgesList.tsx
import { BadgesListProps } from "@/types/profile";
import { ProfileSection } from "./ProfileSection";

export const BadgesList = ({ badges = [], isLoading = false }: BadgesListProps) => (
  <ProfileSection title="Earned Badges">
    {isLoading ? (
      <p>Loading badges...</p>
    ) : badges.length > 0 ? (
      <ul className="space-y-2">
        {badges.map((badge, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-2xl">🏆</span>
            <div>
              <p className="font-medium">{badge.title}</p>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>No badges earned yet.</p>
    )}
  </ProfileSection>
);