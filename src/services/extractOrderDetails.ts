export const extractOrderDetails = (text: string) => {
  const msg = text.toLowerCase();

  let data: any = {};

  // 🎂 cake type
  if (msg.includes("chocolate")) data.cakeType = "Chocolate";
  if (msg.includes("vanilla")) data.cakeType = "Vanilla";
  if (msg.includes("red velvet")) data.cakeType = "Red Velvet";

  // 📏 size
  if (msg.includes("1-tier")) data.size = "1-tier";
  if (msg.includes("2-tier")) data.size = "2-tier";
  if (msg.includes("3-tier")) data.size = "3-tier";

  // 📅 date (basic)
  if (msg.includes("today")) data.date = "Today";
  if (msg.includes("tomorrow")) data.date = "Tomorrow";
  if (msg.includes("saturday")) data.date = "Saturday";

  // 📍 location
  if (msg.includes("lekki")) data.location = "Lekki";
  if (msg.includes("ikeja")) data.location = "Ikeja";

  return data;
};
