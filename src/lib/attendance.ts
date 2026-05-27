export function calculateWorkedHours(
  checkIn: string,
  checkOut: string
) {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);

  const start = inH * 60 + inM;
  const end = outH * 60 + outM;

  return Number(((end - start) / 60).toFixed(2));
}

export function calculateExtraHours(hours: number) {
  return hours > 4 ? hours - 4 : 0;
}

export function isLate(
  currentTime: string,
  scheduleStart: string
) {
  const [cH, cM] = currentTime.split(":").map(Number);
  const [sH, sM] = scheduleStart.split(":").map(Number);

  const current = cH * 60 + cM;
  const schedule = sH * 60 + sM;

  return current > schedule + 10;
}