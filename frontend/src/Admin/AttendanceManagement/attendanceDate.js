const indiaDateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const attendanceDateKey = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const calendarDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
    // DateOnly and timezone-free API values are calendar dates, not instants.
    if (calendarDate && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value.slice(10))) {
      return calendarDate[1];
    }
  }

  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "";
  const parts = Object.fromEntries(
    indiaDateParts.formatToParts(instant).map(({ type, value: part }) => [type, part])
  );
  return [parts.year, parts.month, parts.day].join("-");
};

export const attendanceCalendarDate = (value) => {
  const key = attendanceDateKey(value);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
