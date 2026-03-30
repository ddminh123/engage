/**
 * Formats a date as a relative "time ago" string in Vietnamese.
 * Switches to an absolute date when the difference exceeds 24 hours.
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "vừa xong";
  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  // > 24 hours — show absolute date
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  if (sameYear) {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${date.getFullYear()}`;
}
