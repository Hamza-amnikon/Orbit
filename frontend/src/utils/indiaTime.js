export const INDIA_TIME_ZONE = "Asia/Kolkata";

const indiaDateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: INDIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// API DateOnly values have no time zone and must keep their calendar day.
export const indiaDateKey = (value = new Date()) => {
  if (value === null || value === "") return "";
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
    if (dateOnly && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value.slice(10))) {
      return dateOnly[1];
    }
  }

  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "";
  const parts = Object.fromEntries(
    indiaDateParts.formatToParts(instant).map(({ type, value: part }) => [type, part])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const indiaHour = (value = new Date()) => Number(
  new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIME_ZONE,
    hour: "numeric",
    hourCycle: "h23",
  }).format(value)
);

// A local Date for calendar controls, carrying the calendar day in India.
export const indiaCalendarDate = (value = new Date()) => {
  const key = indiaDateKey(value);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatIndiaDate = (value, locale = "en-IN", options = {}) => {
  const key = indiaDateKey(value);
  if (!key) return "";
  const date = new Date(`${key}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    timeZone: INDIA_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatIndiaTime = (value, locale = "en-IN", options = {}) => {
  // SQL DateTime values without an offset represent India wall time in SPARK.
  const timestamp = typeof value === "string"
    ? value.trim().replace(" ", "T")
    : value;
  const withoutOffset = typeof timestamp === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(timestamp) &&
    !/[zZ]|[+-]\d{2}:?\d{2}$/.test(timestamp.slice(10));
  const instant = new Date(withoutOffset ? `${timestamp}+05:30` : timestamp);
  if (Number.isNaN(instant.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    timeZone: INDIA_TIME_ZONE,
    ...options,
  }).format(instant);
};
