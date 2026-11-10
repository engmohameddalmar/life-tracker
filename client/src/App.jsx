import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ROUTINES } from "./routines.js";
import RoutinePage from "./RoutinePage.jsx";

export default function App() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="shell">
      <aside className={menu ? "open" : ""}>
        <h1>Life Tracker</h1>
        <nav>
          {ROUTINES.map(r => (
            <NavLink key={r.id} to={`/${r.id}`} onClick={() => setMenu(false)}>{r.title}</NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <button className="burger" onClick={() => setMenu(!menu)}>Menu</button>
        <Routes>
          <Route path="/" element={<Navigate to="/morning" replace />} />
          {ROUTINES.map(r => <Route key={r.id} path={`/${r.id}`} element={<RoutinePage key={r.id} routine={r} />} />)}
          <Route path="*" element={<Navigate to="/morning" replace />} />
        </Routes>
      </main>
    </div>
  );
}
