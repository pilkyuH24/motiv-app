"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  parseISO,
  isFuture,
  isBefore,
  isEqual,
} from "date-fns";
import CalendarModal from "./CalendarModal";

interface Log {
  date: string;
  isDone: boolean;
  missionTitle: string;
}

interface UserMission {
  id: number;
  missionTitle: string;
  startDate: string;
  endDate: string;
  repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  repeatDays?: boolean[];
}

interface CalendarProps {
  logs: Log[];
  userMissions: UserMission[];
}

export default function Calendar({ logs, userMissions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalLogs, setModalLogs] = useState<Log[]>([]);
  const [futureMissions, setFutureMissions] = useState<Log[]>([]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const paddingStart = getDay(firstDayOfMonth);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  //  Get missions for future dates
  useEffect(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upcomingMissions = userMissions.flatMap((mission) => {
      const start = parseISO(mission.startDate);
      const end = mission.endDate
        ? parseISO(mission.endDate)
        : new Date(today.getTime() + 14 * 86400000); // fallback

      const days = eachDayOfInterval({ start: today, end });

      return days
        .filter((day) => {
          const dayIndex = day.getUTCDay();
          const daysDifference = Math.floor(
            (day.getTime() - start.getTime()) / 86400000
          );

          return (
            isBefore(start, day) &&
            (!end || isBefore(day, end) || isEqual(day, end)) &&
            ((mission.repeatType === "CUSTOM" &&
              mission.repeatDays?.[dayIndex]) ||
              (mission.repeatType === "WEEKLY" && daysDifference % 7 === 0) ||
              (mission.repeatType === "MONTHLY" &&
                day.getDate() === start.getDate()) ||
              mission.repeatType === "DAILY")
          );
        })
        .map((day) => ({
          date: format(day, "yyyy-MM-dd"),
          isDone: false,
          missionTitle: mission.missionTitle,
        }));
    });

    // console.log("✅ futureMissions", upcomingMissions); // debuging
    setFutureMissions(upcomingMissions);
  }, [userMissions]);

  //  Filter logs when a date is clicked
  const handleDateClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayLogs = logs.filter(
      (log) => format(parseISO(log.date), "yyyy-MM-dd") === dateStr
    );

    if (isFuture(day)) {
      const futureLogsForDay = futureMissions.filter(
        (log) => log.date === dateStr
      );
      setModalLogs(futureLogsForDay);
    } else {
      setModalLogs(dayLogs);
    }

    setSelectedDate(day);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
        {format(currentDate, "yyyy MMMM")}
      </h1>

      {/*  Month change buttons */}
      <div className="flex justify-center gap-65 sm:gap-100 lg:justify-between w-full max-w-2xl mb-4 ">
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{
            clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
          }}
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setMonth(currentDate.getMonth() - 1))
            )
          }
        />
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{
            clipPath: "polygon(100% 50%, 0 100%, 0 0)",
          }}
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setMonth(currentDate.getMonth() + 1))
            )
          }
        />
      </div>

      <ul className="grid grid-cols-7 gap-2 list-none text-center">
        {dayLabels.map((day) => (
          <li
            key={day}
            className="font-medium text-gray-800 text-sm sm:text-base lg:text-lg"
          >
            {day}
          </li>
        ))}
        {Array.from({ length: paddingStart }).map((_, i) => (
          <li key={`empty-${i}`} className=""></li>
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");

          //  Optimize search speed by converting logs to Map
          const logMap = new Map<string, Log[]>();
          logs.forEach((log: Log) => {
            const logDateStr = format(parseISO(log.date), "yyyy-MM-dd");
            if (!logMap.has(logDateStr)) logMap.set(logDateStr, []);
            logMap.get(logDateStr)!.push(log);
          });

          //  Get logs for the specific date
          const dayLogs = logMap.get(dateStr) || [];

          //  Check completion status
          const completedCount = dayLogs.filter((log) => log.isDone).length;
          const failedCount = dayLogs.filter((log) => !log.isDone).length;
          const totalCount = dayLogs.length;
          const isFutureDay = isFuture(day);

          //  Default background color setting
          let bgColor = "bg-white/90"; // Default (no records)

          if (isFutureDay && totalCount > 0) {
            bgColor = "bg-gray-300/90"; //  Gray only if future date with logs
          } else if (totalCount === completedCount && completedCount > 0) {
            bgColor = "bg-blue-500/90"; //  All completed (blue)
          } else if (completedCount > 0 && failedCount > 0) {
            bgColor = "bg-orange-500/90"; // ⚠ Partial completion (orange)
          } else if (failedCount === totalCount && totalCount > 0) {
            bgColor = "bg-red-500/90"; //  All incomplete (red)
          }

          return (
            <li
              key={day.getTime()}
              className={`flex flex-col items-center justify-center w-8 h-8 sm:w-16 sm:h-16 lg:w-24 lg:h-24 sm:text-base p-4 rounded-lg shadow-md border border-white/20 transition text-lg font-light 
        ${bgColor} ${isToday(day) ? "border-2 border-white" : ""} 
        hover:bg-opacity-80 cursor-pointer`}
              onClick={() => handleDateClick(day)}
            >
              <time className="text-xl lg:text-3xl font-semibold">
                {format(day, "d")}
              </time>
            </li>
          );
        })}
      </ul>

      {/*  Modal (displayed when a date is clicked) */}
      {selectedDate && (
        <CalendarModal
          selectedDate={selectedDate}
          modalLogs={modalLogs}
          userMissions={userMissions}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}


// ------------------------------------------------------------------------
// GREEN PERCENTAGE 
// ------------------------------------------------------------------------

// Applied to all missions

// "use client";

// import { useState, useEffect } from "react";
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   getDay,
//   isToday,
//   parseISO,
//   isFuture,
//   isBefore,
//   isEqual,
// } from "date-fns";
// import CalendarModal from "./CalendarModal";

// interface Log {
//   date: string;
//   isDone: boolean;
//   missionTitle: string;
// }

// interface UserMission {
//   id: number;
//   missionTitle: string;
//   startDate: string;
//   endDate: string;
//   repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
//   repeatDays?: boolean[];
// }

// interface CalendarProps {
//   logs: Log[];
//   userMissions: UserMission[];
// }

// export default function Calendar({ logs, userMissions }: CalendarProps) {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [modalLogs, setModalLogs] = useState<Log[]>([]);
//   const [futureMissions, setFutureMissions] = useState<Log[]>([]);

//   const firstDayOfMonth = startOfMonth(currentDate);
//   const lastDayOfMonth = endOfMonth(currentDate);
//   const days = eachDayOfInterval({
//     start: firstDayOfMonth,
//     end: lastDayOfMonth,
//   });

//   const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//   const paddingStart = getDay(firstDayOfMonth);

//   useEffect(() => {
//     const today = new Date();
//     today.setUTCHours(0, 0, 0, 0);

//     const upcomingMissions = userMissions.flatMap((mission) => {
//       const start = parseISO(mission.startDate);
//       const end = mission.endDate
//         ? parseISO(mission.endDate)
//         : new Date(today.getTime() + 14 * 86400000);

//       const days = eachDayOfInterval({ start: today, end });

//       return days
//         .filter((day) => {
//           const dayIndex = day.getUTCDay();
//           const daysDifference = Math.floor(
//             (day.getTime() - start.getTime()) / 86400000
//           );

//           return (
//             isBefore(start, day) &&
//             (!end || isBefore(day, end) || isEqual(day, end)) &&
//             ((mission.repeatType === "CUSTOM" &&
//               mission.repeatDays?.[dayIndex]) ||
//               (mission.repeatType === "WEEKLY" && daysDifference % 7 === 0) ||
//               (mission.repeatType === "MONTHLY" &&
//                 day.getDate() === start.getDate()) ||
//               mission.repeatType === "DAILY")
//           );
//         })
//         .map((day) => ({
//           date: format(day, "yyyy-MM-dd"),
//           isDone: false,
//           missionTitle: mission.missionTitle,
//         }));
//     });

//     setFutureMissions(upcomingMissions);
//   }, [userMissions]);

//   const handleDateClick = (day: Date) => {
//     const dateStr = format(day, "yyyy-MM-dd");
//     const dayLogs = logs.filter(
//       (log) => format(parseISO(log.date), "yyyy-MM-dd") === dateStr
//     );

//     if (isFuture(day)) {
//       const futureLogsForDay = futureMissions.filter(
//         (log) => log.date === dateStr
//       );
//       setModalLogs(futureLogsForDay);
//     } else {
//       setModalLogs(dayLogs);
//     }

//     setSelectedDate(day);
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
//         {format(currentDate, "yyyy MMMM")}
//       </h1>

//       <div className="flex justify-center gap-65 sm:gap-100 lg:justify-between w-full max-w-2xl mb-4">
//         <button
//           className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
//           style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%)" }}
//           onClick={() =>
//             setCurrentDate(
//               new Date(currentDate.setMonth(currentDate.getMonth() - 1))
//             )
//           }
//         />
//         <button
//           className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
//           style={{ clipPath: "polygon(100% 50%, 0 100%, 0 0)" }}
//           onClick={() =>
//             setCurrentDate(
//               new Date(currentDate.setMonth(currentDate.getMonth() + 1))
//             )
//           }
//         />
//       </div>

//       <ul className="grid grid-cols-7 gap-2 list-none text-center">
//         {dayLabels.map((day) => (
//           <li
//             key={day}
//             className="font-medium text-gray-800 text-sm sm:text-base lg:text-lg"
//           >
//             {day}
//           </li>
//         ))}
//         {Array.from({ length: paddingStart }).map((_, i) => (
//           <li key={`empty-${i}`} className=""></li>
//         ))}

//         {days.map((day) => {
//           const dateStr = format(day, "yyyy-MM-dd");

//           const logMap = new Map<string, Log[]>();
//           logs.forEach((log: Log) => {
//             const logDateStr = format(parseISO(log.date), "yyyy-MM-dd");
//             if (!logMap.has(logDateStr)) logMap.set(logDateStr, []);
//             logMap.get(logDateStr)!.push(log);
//           });

//           const dayLogs = logMap.get(dateStr) || [];

//           const completedCount = dayLogs.filter((log) => log.isDone).length;
//           const totalCount = dayLogs.length;
//           const isFutureDay = isFuture(day);
//           const isPastWithLogs = !isFutureDay && totalCount > 0;

//           const fillPercent =
//             totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
//           const fillColor =
//             fillPercent === 0 ? "bg-red-500/90" : "bg-green-500/90";

//           return (
//             <li
//               key={day.getTime()}
//               className={`relative overflow-hidden flex flex-col items-center justify-center w-8 h-8 sm:w-16 sm:h-16 lg:w-24 lg:h-24 sm:text-base p-4 rounded-lg shadow-md border border-white/20 transition text-lg font-light 
//               ${isToday(day) ? "border-2 border-white" : ""} 
//               hover:bg-opacity-80 cursor-pointer bg-white/90`}
//               onClick={() => handleDateClick(day)}
//             >
//               {/* Fill bar */}
//               {isPastWithLogs && (
//                 <div
//                   className={`absolute bottom-0 left-0 w-full transition-all duration-300 ease-in-out ${fillColor}`}
//                   style={{ height: `${fillPercent === 0 ? 100 : fillPercent}%`, zIndex: 0 }}
//                 />
//               )}

//               <time
//                 className="text-xl lg:text-3xl font-semibold z-10"
//                 style={{
//                   color: isPastWithLogs && fillPercent > 60 ? "white" : "black",
//                 }}
//               >
//                 {format(day, "d")}
//               </time>
//             </li>
//           );
//         })}
//       </ul>

//       {selectedDate && (
//         <CalendarModal
//           selectedDate={selectedDate}
//           modalLogs={modalLogs}
//           userMissions={userMissions}
//           onClose={() => setSelectedDate(null)}
//         />
//       )}
//     </div>
//   );
// }



// ONLY COMPLETED MISSIONS (Height == completion ratio)

// "use client";

// import { useEffect, useState } from "react";
// import { format, parseISO } from "date-fns";
// import Calendar from "../components/calendar";
// import MissionActions from "../components/MissionActions";
// import Loader from "../components/Loader";
// import Navbar from "../components/navbar";

// interface Log {
//   date: string;
//   isDone: boolean;
//   missionTitle: string;
// }

// interface UserMission {
//   id: number;
//   mission: {
//     title: string;
//     description?: string;
//   };
//   status: "ONGOING" | "COMPLETED" | "FAILED";
//   startDate: string;
//   endDate: string;
//   repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
//   repeatDays?: boolean[];
//   logs: { date: string; isDone: boolean }[];
// }

// export default function Dashboard() {
//   const [userMissions, setUserMissions] = useState<UserMission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMission, setSelectedMission] = useState<string | null>(null);
//   const [showCompleted, setShowCompleted] = useState(false);

//   const refreshMissions = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/user-missions");
//       if (!response.ok) {
//         throw new Error("Failed to fetch missions");
//       }
//       const data = await response.json();
//       setUserMissions(data);
//     } catch (error) {
//       console.error("Error fetching user missions:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshMissions();
//   }, []);

//   if (loading) {
//     return <Loader />;
//   }

//   const today = new Date();
//   today.setUTCHours(0, 0, 0, 0);

//   const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//   const formatRepeatDays = (repeatDays?: boolean[]) => {
//     if (!repeatDays) return "None";
//     return repeatDays
//       .map((active, index) => (active ? daysOfWeek[index] : null))
//       .filter(Boolean)
//       .join(", ");
//   };

//   const activeMissions = userMissions.filter((m) => m.status !== "COMPLETED");
//   const completedMissions = userMissions.filter(
//     (m) => m.status === "COMPLETED"
//   );

//   const selectedMissionData = userMissions.find(
//     (m) => m.mission.title === selectedMission
//   );

//   const calendarSource = selectedMissionData
//     ? [selectedMissionData]
//     : activeMissions;

//   const calendarLogs: Log[] = calendarSource.flatMap((mission) =>
//     mission.logs.map((log) => ({
//       date: format(parseISO(log.date), "yyyy-MM-dd"),
//       isDone: log.isDone,
//       missionTitle: mission.mission.title,
//     }))
//   );

//   const calendarMissions = calendarSource.map((mission) => ({
//     id: mission.id,
//     missionTitle: mission.mission.title,
//     startDate: mission.startDate,
//     endDate: mission.endDate,
//     repeatType: mission.repeatType,
//     repeatDays: mission.repeatDays || [
//       false,
//       false,
//       false,
//       false,
//       false,
//       false,
//       false,
//     ],
//   }));

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col xl:flex-row p-6 gap-6 min-h-fit lg:min-h-screen">
//         <div className="w-full xl:flex-2 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6">
//           <Calendar logs={calendarLogs} userMissions={calendarMissions} />
//         </div>

//         <div className="w-full xl:flex-1 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6 overflow-auto">
//           <h1 className="text-2xl font-bold mb-4">📋 My Mission Dashboard</h1>

//           <button
//             className={`w-full py-2 mb-4 rounded-lg ${
//               selectedMission === null
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-300"
//             }`}
//             onClick={() => setSelectedMission(null)}
//           >
//             🔄 View All Active Missions
//           </button>

//           {activeMissions.length === 0 ? (
//             <p>No active missions.</p>
//           ) : (
//             <ul className="space-y-4">
//               {activeMissions.map((mission) => (
//                 <li
//                   key={mission.id}
//                   className={`border p-4 rounded-lg shadow bg-white/20 backdrop-blur-md cursor-pointer ${
//                     selectedMission === mission.mission.title
//                       ? "border-blue-500 bg-blue-100"
//                       : ""
//                   }`}
//                   onClick={() =>
//                     setSelectedMission(
//                       selectedMission === mission.mission.title
//                         ? null
//                         : mission.mission.title
//                     )
//                   }
//                 >
//                   <h2 className="text-xl font-semibold">
//                     {mission.mission.title}
//                   </h2>
//                   <p className="text-base ml-2 mr-8 mb-2 text-gray-600">
//                     {mission.mission.description || "No description"}
//                   </p>
//                   <p className="text-sm">
//                     📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} -{" "}
//                     {format(parseISO(mission.endDate), "yyyy-MM-dd")}
//                     &nbsp;&nbsp;🔁 {mission.repeatType}
//                   </p>
//                   {mission.repeatType === "CUSTOM" && (
//                     <p className="text-sm">
//                       📅 Repeat Days: {formatRepeatDays(mission.repeatDays)}
//                     </p>
//                   )}
//                   <p className="text-sm mb-2">📌 Status: {mission.status}</p>
//                   <MissionActions
//                     missionId={mission.id}
//                     logs={mission.logs}
//                     status={mission.status}
//                     onMissionUpdate={refreshMissions}
//                   />
//                 </li>
//               ))}
//             </ul>
//           )}

//           <button
//             className="mt-8 w-full py-2 mb-4 rounded-lg bg-gray-100 hover:bg-gray-300 text-gray-800"
//             onClick={() => setShowCompleted((prev) => !prev)}
//           >
//             {showCompleted
//               ? "🙈 Hide Completed Missions"
//               : "✅ View Completed Missions"}
//           </button>

//           {showCompleted && (
//             <div className="mt-6">
//               <h2 className="text-xl font-bold mb-2">✅ Completed Missions</h2>
//               {completedMissions.length === 0 ? (
//                 <p>No completed missions.</p>
//               ) : (
//                 <ul className="space-y-4">
//                   {completedMissions.map((mission) => (
//                     <li
//                       key={mission.id}
//                       className="border p-4 rounded-lg shadow bg-white/10 backdrop-blur-md opacity-80 cursor-pointer"
//                       onClick={() =>
//                         setSelectedMission(
//                           selectedMission === mission.mission.title
//                             ? null
//                             : mission.mission.title
//                         )
//                       }
//                     >
//                       <h2 className="text-lg font-semibold">
//                         {mission.mission.title}
//                       </h2>
//                       <p className="text-sm text-gray-600 mb-1">
//                         📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} -{" "}
//                         {format(parseISO(mission.endDate), "yyyy-MM-dd")}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         📌 Status: {mission.status}
//                       </p>
//                       <MissionActions
//                         missionId={mission.id}
//                         logs={mission.logs}
//                         status={mission.status}
//                         onMissionUpdate={refreshMissions}
//                       />
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
