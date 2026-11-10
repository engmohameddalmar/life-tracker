import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { START, END, TOTAL_DAYS } from "./routines.js";

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const api = (url, opt) => fetch(url, opt).then(r => r.json());

export default function RoutinePage({ routine }) {
  const { id, title, habits, color } = routine;
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("today");
  const N = habits.length;
  const count = e => habits.filter(h => e.habits?.[h.key]).length;

  useEffect(() => { api(`/api/${id}/entries`).then(setEntries); }, [id]);
  const map = useMemo(() => Object.fromEntries(entries.map(e => [e.date, e])), [entries]);

  const toggle = async (date, key) => {
    const next = { ...(map[date]?.habits || {}), [key]: !map[date]?.habits?.[key] };
    const saved = await api(`/api/${id}/entries/${date}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habits: next }) });
    setEntries(es => [saved, ...es.filter(e => e.date !== date)].sort((a, b) => b.date.localeCompare(a.date)));
  };

  const ctx = { habits, N, count, entries, map, toggle };
  return (
    <div style={{ "--accent": color }}>
      <header>
        <h2>{title}</h2>
        <div className="tabs">
          {[["today", "Today"], ["progress", "Progress"], ["history", "History"]].map(([k, l]) =>
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>
      </header>
      {tab === "today" && <Today {...ctx} />}
      {tab === "progress" && <Progress {...ctx} />}
      {tab === "history" && <History {...ctx} />}
    </div>
  );
}

function Today({ N, count, entries, map, toggle, habits }) {
  const today = iso(new Date());
  const inRange = today >= START && today <= END;
  const day = inRange ? Math.round((new Date(today) - new Date(START)) / 864e5) + 1 : 0;
  const totalTicks = entries.reduce((s, e) => s + count(e), 0);
  const max = day * N;
  return (
    <section>
      <p className="lead">
        {inRange ? <>Day <b>{day}</b> of {TOTAL_DAYS}</> : today < START ? <>Your 7 years begin on 23 August 2026</> : <>The 7 years are complete</>}
        {" · "}{totalTicks} ticks in total{max ? ` (${Math.round(totalTicks / max * 100)}% of possible)` : ""}
      </p>
      {inRange && <DayList date={today} entry={map[today]} toggle={toggle} habits={habits} count={count} />}
      <div className="bar"><i style={{ width: `${(day / TOTAL_DAYS) * 100}%` }} /></div>
    </section>
  );
}

function DayList({ date, entry, toggle, habits, count }) {
  return (
    <div className="day">
      <h3>{new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        <span>{entry ? count(entry) : 0}/{habits.length}</span></h3>
      {habits.map(h => (
        <label key={h.key} className={entry?.habits?.[h.key] ? "done" : ""}>
          <input type="checkbox" checked={!!entry?.habits?.[h.key]} onChange={() => toggle(date, h.key)} />
          {h.label}
        </label>
      ))}
    </div>
  );
}

function streaks(entries, N, count) {
  const perfect = new Set(entries.filter(e => count(e) === N).map(e => e.date));
  let cur = 0;
  const d = new Date();
  if (!perfect.has(iso(d))) d.setDate(d.getDate() - 1); // today may still be in progress
  while (perfect.has(iso(d))) { cur++; d.setDate(d.getDate() - 1); }
  let best = 0, run = 0, prev = null;
  [...perfect].sort().forEach(date => {
    run = prev && (new Date(date) - new Date(prev)) / 864e5 === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = date;
  });
  return { cur, best, perfect: perfect.size };
}

function Progress({ habits, N, count, entries }) {
  const s = streaks(entries, N, count);
  const perHabit = habits.map(h => ({ name: h.label.length > 22 ? h.label.slice(0, 22) + "…" : h.label, total: entries.filter(e => e.habits?.[h.key]).length }));
  const monthly = useMemo(() => {
    const m = {};
    entries.forEach(e => { const k = e.date.slice(0, 7); m[k] = (m[k] || 0) + count(e); });
    return Object.entries(m).sort().map(([month, ticks]) => ({ month, ticks }));
  }, [entries]);
  const last30 = useMemo(() => {
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const e = entries.find(x => x.date === iso(d));
      out.push({ day: iso(d).slice(5), done: e ? count(e) : 0 });
    }
    return out;
  }, [entries]);
  return (
    <section>
      <div className="stats">
        <div><b>{entries.reduce((a, e) => a + count(e), 0)}</b>total ticks</div>
        <div><b>{s.perfect}</b>perfect days</div>
        <div><b>{s.cur}</b>current streak</div>
        <div><b>{s.best}</b>best streak</div>
      </div>
      <h3>Last 30 days</h3>
      <div className="chart"><ResponsiveContainer><LineChart data={last30}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis domain={[0, N]} allowDecimals={false} /><Tooltip /><Line dataKey="done" stroke="var(--accent)" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
      <h3>Total per habit</h3>
      <div className="chart"><ResponsiveContainer><BarChart data={perHabit} layout="vertical" margin={{ left: 40 }}><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={150} /><Tooltip /><Bar dataKey="total" fill="#E0A53A" /></BarChart></ResponsiveContainer></div>
      <h3>Ticks per month</h3>
      <div className="chart"><ResponsiveContainer><BarChart data={monthly}><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="ticks" fill="var(--accent)" /></BarChart></ResponsiveContainer></div>
    </section>
  );
}

function History({ habits, N, count, entries, toggle }) {
  const now = new Date();
  const [mode, setMode] = useState("month");
  const [month, setMonth] = useState(iso(now).slice(0, 7));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [from, setFrom] = useState(START);
  const [to, setTo] = useState(iso(now));
  const list = entries.filter(e =>
    mode === "month" ? e.date.startsWith(month) : mode === "year" ? e.date.startsWith(year) : e.date >= from && e.date <= to);
  const total = list.reduce((s, e) => s + count(e), 0);
  const years = Array.from({ length: 8 }, (_, i) => 2026 + i);
  return (
    <section>
      <div className="filters">
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="month">Month</option><option value="year">Year</option><option value="custom">Custom dates</option>
        </select>
        {mode === "month" && <input type="month" value={month} min="2026-08" max="2033-08" onChange={e => setMonth(e.target.value)} />}
        {mode === "year" && <select value={year} onChange={e => setYear(e.target.value)}>{years.map(y => <option key={y}>{y}</option>)}</select>}
        {mode === "custom" && <>
          <input type="date" value={from} min={START} max={END} onChange={e => setFrom(e.target.value)} />
          <input type="date" value={to} min={START} max={END} onChange={e => setTo(e.target.value)} />
        </>}
      </div>
      <p className="lead">{list.length} days · {total} ticks · {list.filter(e => count(e) === N).length} perfect days</p>
      {list.length === 0 && <p>No days recorded in this period. Tick habits on the Today tab to start your history.</p>}
      <div className="grid">{list.map(e => <DayList key={e.date} date={e.date} entry={e} toggle={toggle} habits={habits} count={count} />)}</div>
    </section>
  );
}
