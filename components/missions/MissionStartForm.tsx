import { useState, useEffect } from "react";
import { Mission, RepeatType, MissionFormData } from "@/types/mission";
import { addMonths } from "date-fns";

interface MissionStartFormProps {
  mission: Mission;
  onClose: () => void;
  onSubmit: (formData: MissionFormData & { mission: Mission }) => Promise<void>;
}

export default function MissionStartForm({ 
  mission, 
  onClose,
  onSubmit
}: MissionStartFormProps) {
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("sv-SE")
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [durationMonths, setDurationMonths] = useState(1);
  const [repeatType, setRepeatType] = useState<RepeatType>("DAILY");
  const [repeatDays, setRepeatDays] = useState<boolean[]>([
    false, false, false, false, false, false, false
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repeatOptions: RepeatType[] = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"];

  const calculateEndDate = (start: string, months: number): string => {
    const startDate = new Date(start);
    const end = addMonths(startDate, months);
    return end.toISOString().split("T")[0];
  };

  useEffect(() => {
    setEndDate(calculateEndDate(startDate, durationMonths));
  }, [startDate, durationMonths]);

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev) => {
      const newRepeatDays = [...prev];
      newRepeatDays[dayIndex] = !newRepeatDays[dayIndex];
      return newRepeatDays;
    });
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please fill in all the required fields!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        mission,
        startDate,
        endDate,
        durationMonths,
        repeatType,
        repeatDays
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        className="p-6 rounded-lg shadow-lg w-96"
        style={{
          background: `linear-gradient(120deg, rgb(255, 231, 222) 60%, rgb(255, 185, 160) 100%)`,
          color: "#333",
        }}
      >
        <h2 className="text-xl font-bold mb-2">{mission.title}</h2>

        <label className="block mt-4 text-sm font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <label className="block mt-4 text-sm font-medium">
          Duration (in months)
        </label>
        <div className="flex flex-wrap justify-start gap-2">
          {[1, 2, 3, 6, 12].map((month) => (
            <button
              key={month}
              className={`px-3 py-1 rounded-md ${
                durationMonths === month
                  ? "bg-rose-400 text-white"
                  : "bg-white hover:bg-rose-300/80"
              }`}
              onClick={() => setDurationMonths(month)}
            >
              {month} month{month > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <label className="block mt-4 text-sm font-medium">End Date</label>
        <input
          type="date"
          value={endDate}
          // readOnly 
          onChange={(e) => setEndDate(e.target.value)} // For mission complete test
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
        <p className="text-sm text-gray-600 mt-1">
          * Automatically set to {durationMonths} month
          {durationMonths > 1 ? "s" : ""} after the start date.
        </p>

        <label className="block mt-4 text-sm font-medium">
          Repeat Type
        </label>
        <div className="flex flex-wrap justify-start gap-1">
          {repeatOptions.map((type) => (
            <button
              key={type}
              className={`m-1 px-3 py-1 rounded-md ${
                repeatType === type
                  ? "bg-rose-400 text-white"
                  : "bg-white hover:bg-rose-300/80"
              }`}
              onClick={() => setRepeatType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {repeatType === "CUSTOM" && (
          <div>
            <label className="block mt-4 text-sm font-medium">
              Select Repeat Days
            </label>
            <div className="flex flex-wrap gap-1">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                (day, index) => (
                  <button
                    key={day}
                    className={`m-1 px-3 py-1 rounded-md ${
                      repeatDays[index]
                        ? "bg-rose-400 text-white"
                        : "bg-white hover:bg-rose-300/80"
                    }`}
                    onClick={() => toggleRepeatDay(index)}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-white text-gray-800 rounded-lg"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Starting..." : "Start Mission"}
          </button>
        </div>
      </div>
    </div>
  );
}