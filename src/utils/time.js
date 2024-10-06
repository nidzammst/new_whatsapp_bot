// Get the current time with WIB (Western Indonesian Time) timezone
const currentTime = new Date();
const timezoneOptionsWIB = { timeZone: "Asia/Jakarta" };
const currentTimeWIB = new Intl.DateTimeFormat("id-ID", {
  timeStyle: "short",
  ...timezoneOptionsWIB,
}).format(currentTime);

let timeOfDay;

if (currentTimeWIB >= 0 && currentTimeWIB < 12) {
  timeOfDay = "Pagi";
} else if (currentTimeWIB >= 12 && currentTimeWIB < 15) {
  timeOfDay = "Siang";
} else if (currentTimeWIB >= 15 && currentTimeWIB < 18) {
  timeOfDay = "Sore";
} else {
  timeOfDay = "Malam";
}

module.exports = {
  timeOfDay,
};
