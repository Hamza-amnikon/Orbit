import { indiaDateKey } from "../../utils/indiaTime";

export const attendanceDateKey = (value) => value ? indiaDateKey(value) : "";

export const attendanceCalendarDate = (value) => {
  const key = attendanceDateKey(value);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
