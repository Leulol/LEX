import { useEffect, useMemo, useState } from "react";
import { journalApi } from "../services/taskApi.js";

export default function JournalModule() {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await journalApi.getEntries();
        const loaded = res?.data?.entries;
        if (cancelled) return;
        setEntries(Array.isArray(loaded) ? loaded : []);
      } catch (err) {
        console.error("Failed to load journal entries:", err);
        if (cancelled) return;
        setEntries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const copy = Array.isArray(entries) ? [...entries] : [];
    return copy.sort((a, b) => Number(b.ts ?? 0) - Number(a.ts ?? 0));
  }, [entries]);

  async function addEntry() {
    const text = draft.trim();
    if (!text) return;
    const ts = Date.now();
    try {
      const res = await journalApi.addEntry({ text, ts });
      const created = res?.data;
      if (created && typeof created === "object") {
        setEntries((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        const refreshed = await journalApi.getEntries();
        setEntries(Array.isArray(refreshed?.data?.entries) ? refreshed.data.entries : []);
      }
      setDraft("");
    } catch (err) {
      console.error("Failed to add journal entry:", err);
    }
  }

  async function removeEntry(id) {
    try {
      await journalApi.deleteEntry(id);
      setEntries((prev) => (Array.isArray(prev) ? prev.filter((e) => e.id !== id) : []));
    } catch (err) {
      console.error("Failed to delete journal entry:", err);
    }
  }

  return (
    <div className="tm-module" role="tabpanel" aria-label="Journal">
      <div className="tm-moduleHeader">
        <h2 className="tm-moduleTitle">Journal</h2>
        <p className="tm-moduleSub">Quick notes, reflections, and wins.</p>
      </div>

      <div className="tm-journalComposer">
        <textarea
          className="tm-input tm-journalText"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write something..."
          aria-label="Journal entry"
        />
        <button className="tm-btn tm-btnPrimary" type="button" onClick={addEntry}>
          Save Entry
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="tm-empty">No journal entries yet.</div>
      ) : (
        <ul className="tm-journalList" aria-label="Journal entries">
          {sorted.map((e) => (
            <li key={e.id} className="tm-journalEntry">
              <div className="tm-journalMeta">
                {new Date(e.ts).toLocaleString()}
              </div>
              <div className="tm-journalBody">{e.text}</div>
              <button
                type="button"
                className="tm-iconBtn tm-iconBtnDanger"
                aria-label="Delete entry"
                onClick={() => removeEntry(e.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
