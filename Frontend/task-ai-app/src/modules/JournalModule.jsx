import { useEffect, useMemo, useState } from "react";

function safeParseJson(text, fallback) {
  try {
    const parsed = JSON.parse(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export default function JournalModule() {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("journal_entries");
    const loaded = safeParseJson(raw, []);
    setEntries(Array.isArray(loaded) ? loaded : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("journal_entries", JSON.stringify(entries));
  }, [entries]);

  const sorted = useMemo(() => {
    const copy = Array.isArray(entries) ? [...entries] : [];
    return copy.sort((a, b) => Number(b.ts ?? 0) - Number(a.ts ?? 0));
  }, [entries]);

  function addEntry() {
    const text = draft.trim();
    if (!text) return;
    const ts = Date.now();
    setEntries((prev) => [
      { id: globalThis.crypto?.randomUUID?.() ?? String(ts), ts, text },
      ...prev,
    ]);
    setDraft("");
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
