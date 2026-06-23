import React from "react";

const isWorkingDay = (date, saturdayRule = "5-day") => {
  const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
  if (dayOfWeek === 0) return false;
  if (dayOfWeek === 6) {
    if (saturdayRule === "5-day") return false;
    if (saturdayRule === "6-day") return true;
    if (saturdayRule === "2nd-4th-off") {
      const day = date.getDate();
      const isSecondSaturday = day >= 8 && day <= 14;
      const isFourthSaturday = day >= 22 && day <= 28;
      return !(isSecondSaturday || isFourthSaturday);
    }
  }
  return true;
};

export default function AttendanceCalendar({
  year,
  month,
  employeeLogs = [],
  joinDate,
  saturdayRule = "5-day",
}) {
  if (!year || !month) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Create a map of date strings ("YYYY-M-D") to status
  const logMap = {};
  employeeLogs.forEach((log) => {
    if (log.date) {
      const parts = log.date.split("-");
      if (parts.length === 3) {
        // Normalize to YYYY-M-D
        const dStr = `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}-${parseInt(parts[2], 10)}`;
        logMap[dStr] = log.status;
      }
    }
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const joinDayObj = joinDate ? new Date(joinDate) : null;
  const joinYear = joinDayObj ? joinDayObj.getFullYear() : 0;
  const joinMonth = joinDayObj ? joinDayObj.getMonth() + 1 : 0;
  const joinDay = joinDayObj ? joinDayObj.getDate() : 1;

  const days = [];
  // padding for the first day of the week
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const getDayStatus = (d) => {
    const dateStr = `${year}-${month}-${d}`;
    const dateObj = new Date(year, month - 1, d);

    // Using simple midnight-to-midnight comparison
    const isPastOrToday = dateObj.getTime() <= now.getTime();
    const isBeforeJoin =
      year < joinYear ||
      (year === joinYear && month < joinMonth) ||
      (year === joinYear && month === joinMonth && d < joinDay);

    if (isBeforeJoin) {
      return {
        status: "Not Joined",
        color: "bg-slate-50 text-slate-300 border-slate-100",
      };
    }

    if (!isWorkingDay(dateObj, saturdayRule)) {
      return {
        status: "Holiday/Off",
        color: "bg-slate-100 text-slate-400 border-slate-200",
      };
    }

    if (!isPastOrToday) {
      return {
        status: "Upcoming",
        color: "bg-white border-dashed border-slate-200 text-slate-400",
      };
    }

    const logStatus = logMap[dateStr];
    if (logStatus === "Present" || logStatus === "Late") {
      return {
        status: logStatus,
        color: "bg-emerald-50 border-emerald-400 text-emerald-600 font-bold",
      };
    } else {
      // If past or today, and it's a working day, and no Present log, it's Absent
      return {
        status: "Absent",
        color: "bg-red-50 border-red-400 text-red-600 font-bold",
      };
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
        Attendance Calendar
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
          >
            {day}
          </div>
        ))}
        {days.map((d, index) => {
          if (d === null) {
            return <div key={`empty-${index}`} className="h-10"></div>;
          }
          const { status, color } = getDayStatus(d);
          return (
            <div
              key={d}
              className={`h-10 flex items-center justify-center rounded border ${color} text-sm transition-all hover:opacity-80`}
              title={`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}: ${status}`}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-400"></span>{" "}
          Present
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-400"></span>{" "}
          Absent
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>{" "}
          Off Day
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border-dashed border-2 border-slate-200"></span>{" "}
          Upcoming
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-50 border border-slate-100"></span>{" "}
          Not Joined
        </div>
      </div>
    </div>
  );
}
