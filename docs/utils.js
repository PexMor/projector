export const timeStrToMs = (timeStr) => {
  let timeMs = 0;
  // convert timestring like 1h2m3s to milliseconds
  const re = /(\d+)(h|m|s)/g;
  let match;
  while ((match = re.exec(timeStr)) !== null) {
    let unit = match[2];
    let value = parseInt(match[1]);
    if (unit === "h") {
      timeMs += value * 60 * 60 * 1000;
    } else if (unit === "m") {
      timeMs += value * 60 * 1000;
    } else if (unit === "s") {
      timeMs += value * 1000;
    }
  }
  return timeMs;
};
