//components/missions/MissionCard.tsx
import { Mission } from "@/types/mission";
import "./MissionCard.css";

interface MissionCardProps {
  mission: Mission;
  onStartMission: (mission: Mission) => void;
}

export default function MissionCard({ mission, onStartMission }: MissionCardProps) {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front rounded-2xl">
          <h2 className="text-3xl mb-5">{mission.title}</h2>
          <p className="text-start text-base text-gray-700">
            {mission.description || "No description available"}
          </p>
        </div>
        <div className="flip-card-back text-2xl rounded-2xl">
          <h2 className="title">{mission.title}</h2>
          <button
            className="challenge-button"
            onClick={() => onStartMission(mission)}
          >
            Start Mission
          </button>
        </div>
      </div>
    </div>
  );
}