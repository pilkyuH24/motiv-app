import { Mission } from "@/types/mission";
import MissionCard from "./MissionCard";

interface MissionTypeSectionProps {
  type: string;
  missions: Mission[];
  onStartMission: (mission: Mission) => void;
}

export default function MissionTypeSection({ 
  type, 
  missions,
  onStartMission 
}: MissionTypeSectionProps) {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between px-8 mb-4">
        <h2 className="text-2xl font-bold">{type}</h2>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 px-8">
        {missions.map((mission) => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            onStartMission={onStartMission}
          />
        ))}
      </div>
    </div>
  );
}