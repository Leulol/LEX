import { useEffect, useMemo, useState } from "react";
import { plannerApi } from "../services/taskApi.js";

function todayIso() {//Gets the date for line 22
  const d = new Date();//Make a new date and we will extracte the day using the getDate below
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PlannerModule() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await plannerApi.getItems();
        const loaded = res?.data;
        if (cancelled) return;
        setItems(Array.isArray(loaded) ? loaded : []);
      } catch (err) {
        console.error("Failed to load planner items:", err);
        if (cancelled) return;
        setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const copy = Array.isArray(items) ? [...items] : [];
    return copy.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [items]);

  async function addItem() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    try {
      const res = await plannerApi.addItem({ title: nextTitle, date });
      const created = res?.data;
      if (created && typeof created === "object") {
        setItems((prev) => [...(Array.isArray(prev) ? prev : []), created]);
      } else {
        const refreshed = await plannerApi.getItems();
        setItems(Array.isArray(refreshed?.data) ? refreshed.data : []);
      }
      setTitle("");
    } catch (err) {
      console.error("Failed to add planner item:", err);
    }
  }

  async function toggleDone(id) {
    const current = Array.isArray(items) ? items.find((it) => it.id === id) : null;
    if (!current) return;
    const nextDone = !current.done;
    try {
      const res = await plannerApi.updateItem(id, { done: nextDone });
      const updated = res?.data;
      if (updated && typeof updated === "object") {
        setItems((prev) =>
          (Array.isArray(prev) ? prev : []).map((it) => (it.id === id ? updated : it))
        );
      } else {
        setItems((prev) =>
          (Array.isArray(prev) ? prev : []).map((it) => (it.id === id ? { ...it, done: nextDone } : it))
        );
      }
    } catch (err) {
      console.error("Failed to update planner item:", err);
    }
  }

  async function removeItem(id) {
    try {
      await plannerApi.deleteItem(id);
      setItems((prev) => (Array.isArray(prev) ? prev.filter((it) => it.id !== id) : []));
    } catch (err) {
      console.error("Failed to delete planner item:", err);
    }
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
