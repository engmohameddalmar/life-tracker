import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Entry from "./models/Entry.js";
import { ROUTINES, START, END } from "./routines.js";

const app = express();
app.use(cors(), express.json());

const check = (req, res, next) =>
  ROUTINES[req.params.routine] ? next() : res.status(404).json({ error: "Unknown routine" });

// GET /api/morning/entries?from=YYYY-MM-DD&to=YYYY-MM-DD
app.get("/api/:routine/entries", check, async (req, res) => {
  const { from = START, to = END } = req.query;
  const rows = await Entry.find({ routine: req.params.routine, date: { $gte: from, $lte: to } }).sort({ date: -1 }).lean();
  res.json(rows.map(r => ({ ...r, habits: r.habits ?? {} })));
});

// PUT /api/night/entries/2026-09-01  { habits: { read: true, ... } }
app.put("/api/:routine/entries/:date", check, async (req, res) => {
  const { routine, date } = req.params;
  if (date < START || date > END) return res.status(400).json({ error: `Date must be between ${START} and ${END}` });
  const habits = Object.fromEntries(ROUTINES[routine].map(k => [k, !!req.body.habits?.[k]]));
  const doc = await Entry.findOneAndUpdate({ routine, date }, { routine, date, habits }, { upsert: true, new: true, runValidators: true }).lean();
  res.json(doc);
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log("API on :" + (process.env.PORT || 5000)));
