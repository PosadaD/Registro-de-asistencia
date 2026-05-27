export function isWeekend(date: Date) {
  const day = date.getDay();

  return day === 0 || day === 6;
}