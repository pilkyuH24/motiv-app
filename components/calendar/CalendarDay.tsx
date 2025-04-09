import { FC } from "react";
import { format, isToday } from "date-fns";
import { CalendarLogStatus } from "@/lib/services/calendarService";

interface CalendarDayProps {
  day: Date;
  status: CalendarLogStatus;
  onClick: (day: Date) => void;
}

export const CalendarDay: FC<CalendarDayProps> = ({ day, status, onClick }) => {
  const getBgColor = (status: CalendarLogStatus) => {
    switch (status) {
      case "future": return "bg-gray-300/90";
      case "completed": return "bg-blue-500/90";
      case "partial": return "bg-orange-500/90";
      case "failed": return "bg-red-500/90";
      default: return "bg-white/90";
    }
  };

  const bgColor = getBgColor(status);

  return (
    <li
      className={`flex flex-col items-center justify-center w-8 h-8 sm:w-16 sm:h-16 xl:w-24 xl:h-24 sm:text-base p-4 rounded-lg shadow-md border border-white/20 transition text-lg font-light 
      ${bgColor} ${isToday(day) ? "border-2 border-white" : ""} 
      hover:bg-opacity-80 cursor-pointer`}
      onClick={() => onClick(day)}
    >
      <time className="text-xl xl:text-3xl font-semibold">
        {format(day, "d")}
      </time>
    </li>
  );
};