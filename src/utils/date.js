const isValidDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(date.getTime());
};

const toDate = (value) => (isValidDate(value) ? new Date(value) : null);

export const formatDate = (value, fallback = "Not available") => {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
    : fallback;
};

export const formatDateTime = (value, fallback = "Not available") => {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : fallback;
};

export const formatLongDate = (value, fallback = "Not available") => {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
      }).format(date)
    : fallback;
};

export const formatRelativeDate = (value, fallback = "Not available") => {
  const date = toDate(value);
  if (!date) return fallback;

  const difference = date.getTime() - Date.now();
  const minutes = Math.round(difference / 60000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
};
