import mongoose from "mongoose";
const schema = new mongoose.Schema({
  routine: { type: String, required: true },          // "morning" | "night"
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
  habits: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });
schema.index({ routine: 1, date: 1 }, { unique: true });
export default mongoose.model("Entry", schema);
