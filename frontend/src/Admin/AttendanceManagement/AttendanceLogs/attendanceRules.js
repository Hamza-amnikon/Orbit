export const HALF_DAY_THRESHOLD_MINUTES = 8 * 60 + 15;

const parseTimeMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/(?:^|T)(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};
export const getWorkedMinutes = (checkIn, checkOut) => {
  const start = parseTimeMinutes(checkIn);
  const end = parseTimeMinutes(checkOut);
  if (start === null || end === null) return null;
  return (end <= start ? end + 24 * 60 : end) - start;
};

export const formatWorkedHours = (checkIn, checkOut) => {
  const minutes = getWorkedMinutes(checkIn, checkOut);
  if (minutes === null) return "";
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

export const getAttendanceStatusForDuration = (status, checkIn, checkOut) => {
  const current = String(status || "").trim();
  const normalized = current.toLowerCase().replace(/[ _-]/g, "");
  if (!["present", "late", "halfday"].includes(normalized)) return current;

  const minutes = getWorkedMinutes(checkIn, checkOut);
  if (minutes === null) return current;
  if (minutes < HALF_DAY_THRESHOLD_MINUTES) return "Half Day";
  return normalized === "late" ? "Late" : "Present";
};
