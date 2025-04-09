import { FC } from "react";

interface CalendarHeaderProps {
  title: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: FC<CalendarHeaderProps> = ({ 
  title, 
  onPrevMonth, 
  onNextMonth 
}) => {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
        {title}
      </h1>

      <div className="flex justify-center gap-65 sm:gap-100 xl:justify-between w-full max-w-2xl mb-4">
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%)" }}
          onClick={onPrevMonth}
        />
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{ clipPath: "polygon(100% 50%, 0 100%, 0 0)" }}
          onClick={onNextMonth}
        />
      </div>
    </>
  );
};