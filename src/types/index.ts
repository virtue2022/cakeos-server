export type Stage =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Interested"
  | "Negotiation"
  | "Closing" // ✅ ADD THIS
  | "Converted"
  | "Lost";

export type Lead = {
  _id: string;
  name: string;
  email?: string;
  stage?: string;

  // 🔥 ADD THESE
  cakeType?: string;
  size?: string;
  date?: string;
  location?: string;
};
