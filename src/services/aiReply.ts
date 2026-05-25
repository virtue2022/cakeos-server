export const generateReply = (text: string): string => {
  const msg = text.toLowerCase();

  // 🟢 GREETING
  if (msg.includes("hi") || msg.includes("hello")) {
    return "Hi 👋 Welcome! I can help you get the perfect cake 🎂\n\nWhat kind of cake would you like?";
  }

  // 🎂 CAKE TYPE / INTEREST
  if (
    msg.includes("cake") ||
    msg.includes("birthday") ||
    msg.includes("wedding")
  ) {
    return "Great choice 🎂\n\nWhat flavor would you like?\n👉 Chocolate\n👉 Vanilla\n👉 Red Velvet";
  }

  // 📏 SIZE
  if (
    msg.includes("tier") ||
    msg.includes("size") ||
    msg.includes("big") ||
    msg.includes("small")
  ) {
    return "Nice 👍 What size do you want?\n👉 1-tier\n👉 2-tier\n👉 3-tier";
  }

  // 💰 PRICE
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much")
  ) {
    return "Our cakes start from ₦25,000 depending on size and design 🎂\n\nWhat size are you considering?";
  }

  // 📅 DATE
  if (msg.includes("date") || msg.includes("when") || msg.includes("day")) {
    return "When do you need the cake? 📅";
  }

  // 📍 DELIVERY
  if (
    msg.includes("delivery") ||
    msg.includes("location") ||
    msg.includes("where")
  ) {
    return "We offer delivery 🚚\n\nWhere should we deliver to?";
  }

  // 🧾 ORDER INTENT (GUIDED)
  if (msg.includes("order") || msg.includes("book")) {
    return "Perfect 🎉 Let me confirm your order:\n\n• Cake type\n• Size\n• Date\n• Delivery location\n\nOnce everything looks good, type *confirm* to finalize your order.";
  }

  // 💳 CONFIRMATION (MATCHES YOUR SIMULATED PAYMENT)
  if (msg.includes("confirm") || msg.includes("ready")) {
    return "Awesome 🎉 Your order is almost ready.\n\nType *confirm* to finalize and we’ll start preparing your cake immediately 🎂";
  }

  // 💳 PAYMENT (OPTIONAL FLOW)
  if (msg.includes("pay")) {
    return "You're almost done 💳\n\nJust type *confirm* to finalize your order.";
  }

  // ❓ FALLBACK (SMARTER)
  return "Got it 👍\n\nTell me:\n• Cake type 🎂\n• Size 📏\n• Date 📅\n• Delivery location 📍\n\nI’ll help you complete your order.";
};
