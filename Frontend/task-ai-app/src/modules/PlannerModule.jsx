import { useEffect, useMemo, useState } from "react";

function todayIso() {//Gets the date for line 22
  const d = new Date();//Make a new date and we will extracte the day using the getDate below
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeParseJson(text, fallback) {//Convertes the Javascript object to JSON for React
  try {
    const parsed = JSON.parse(text);
    return parsed ?? fallback;//retruns the right side when its strictly null or unidentifed only(left side)
  } catch {
    return fallback;
  }
}

export default function PlannerModule() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("planner_items");//Change this to backend
    const loaded = safeParseJson(raw, []);
    setItems(Array.isArray(loaded) ? loaded : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("planner_items", JSON.stringify(items));
  }, [items]);

  const visible = useMemo(() => {
    const copy = Array.isArray(items) ? [...items] : [];
    return copy.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [items]);

  function addItem() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setItems((prev) => [
      ...prev,//Copies the prev planned items
      {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        title: nextTitle,
        date,
        done: false,
      },
    ]);
    setTitle("");
  }

  function toggleDone(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));//Kickes out the false statment whcih is the given id
  }

  return (
    <div className="tm-module" role="tabpanel" aria-label="Planner">
      <div className="tm-moduleHeader">
        <h2 className="tm-moduleTitle">Planned</h2>
        <p className="tm-moduleSub">Do It MF</p>
      </div>

      <div className="tm-plannerForm">
        <input
          className="tm-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a plan item..."
          aria-label="Plan item title"
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />
        <input
          className="tm-input tm-dateInput"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Plan date"
        />
        <button className="tm-btn tm-btnPrimary" type="button" onClick={addItem}>
          Add
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="tm-empty">No planner items yet.</div>
      ) : (
        <ul className="tm-plannerList" aria-label="Planner items">
          {visible.map((it) => (
            <li key={it.id} className={it.done ? "tm-plannerItem tm-plannerItemDone" : "tm-plannerItem"}>
              <button
                type="button"
                className="tm-iconBtn"
                aria-label={it.done ? "Mark not done" : "Mark done"}
                onClick={() => toggleDone(it.id)}
              >
                {it.done ? "✓" : "○"}
              </button>
              <div className="tm-plannerMain">
                <div className="tm-plannerTitle">{it.title}</div>
                <div className="tm-plannerMeta">{String(it.date || "")}</div>
              </div>
              <button
                type="button"
                className="tm-iconBtn tm-iconBtnDanger"
                aria-label="Remove planner item"
                onClick={() => removeItem(it.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
