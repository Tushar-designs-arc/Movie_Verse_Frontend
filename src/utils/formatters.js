export const formatNumber = (value, fallback = "N/A") => {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(undefined).format(number)
    : fallback;
};

export const formatDuration = (minutes, fallback = "N/A") => {
  const totalMinutes = Number(minutes);
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return fallback;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

export const formatViews = (value, fallback = "N/A") =>
  formatNumber(value, fallback);

export const formatRating = (value, fallback = "N/A") => {
  const rating = Number(value);
  return Number.isFinite(rating) ? rating.toFixed(1) : fallback;
};
