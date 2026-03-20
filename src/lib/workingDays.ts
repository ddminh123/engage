import { eachDayOfInterval, isWeekend, getYear } from "date-fns";

/**
 * Vietnamese public holidays (fixed dates)
 * Note: Lunar calendar holidays (Tết, Giỗ Tổ Hùng Vương) vary each year
 * and would need a lunar calendar library for accurate calculation.
 * For now, we include approximate Gregorian dates for common years.
 */
function getVietnameseHolidays(year: number): Date[] {
  const holidays: Date[] = [
    // New Year's Day - January 1
    new Date(year, 0, 1),

    // Reunification Day - April 30
    new Date(year, 3, 30),

    // International Workers' Day - May 1
    new Date(year, 4, 1),

    // National Day - September 2
    new Date(year, 8, 2),
  ];

  // Tết Nguyên Đán (Lunar New Year) - approximate dates
  // These are rough estimates; actual dates vary by year
  const tetDates: Record<number, [number, number][]> = {
    2024: [[1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14]], // Feb 8-14
    2025: [[0, 28], [0, 29], [0, 30], [0, 31], [1, 1], [1, 2], [1, 3]], // Jan 28 - Feb 3
    2026: [[1, 16], [1, 17], [1, 18], [1, 19], [1, 20], [1, 21], [1, 22]], // Feb 16-22
    2027: [[1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11]], // Feb 5-11
    2028: [[0, 25], [0, 26], [0, 27], [0, 28], [0, 29], [0, 30], [0, 31]], // Jan 25-31
    2029: [[1, 12], [1, 13], [1, 14], [1, 15], [1, 16], [1, 17], [1, 18]], // Feb 12-18
    2030: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8]], // Feb 2-8
  };

  if (tetDates[year]) {
    tetDates[year].forEach(([month, day]) => {
      holidays.push(new Date(year, month, day));
    });
  }

  // Giỗ Tổ Hùng Vương (Hung Kings' Temple Festival) - 10th day of 3rd lunar month
  // Approximate Gregorian dates
  const hungKingsDates: Record<number, [number, number]> = {
    2024: [3, 18], // April 18
    2025: [3, 7], // April 7
    2026: [3, 26], // April 26
    2027: [3, 15], // April 15
    2028: [3, 3], // April 3
    2029: [3, 22], // April 22
    2030: [3, 11], // April 11
  };

  if (hungKingsDates[year]) {
    const [month, day] = hungKingsDates[year];
    holidays.push(new Date(year, month, day));
  }

  return holidays;
}

/**
 * Check if a date is a Vietnamese public holiday
 */
function isVietnameseHoliday(date: Date): boolean {
  const year = getYear(date);
  const holidays = getVietnameseHolidays(year);

  return holidays.some(
    (holiday) =>
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate(),
  );
}

/**
 * Calculate the number of working days between two dates (inclusive)
 * Excludes weekends (Saturday, Sunday) and Vietnamese public holidays
 */
export function calculateWorkingDays(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  if (end < start) {
    return 0;
  }

  const days = eachDayOfInterval({ start, end });

  return days.filter((day) => !isWeekend(day) && !isVietnameseHoliday(day))
    .length;
}
