import { useEffect, useRef, useState } from "react";
import "./PomodoroWidget.css";

const ACCENT = "#D85A30";
const STORAGE_KEY = "tm-pomodoro-v1";
const TASK_KEY = "tm-pomodoro-task-id";

const MODE_META = {
  focus: { label: "Focus", seconds: 25 * 60 },
  short: { label: "Short break", seconds: 5 * 60 },
  long: { label: "Long break", seconds: 15 * 60 },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMMSS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${pad2(m)}:${pad2(r)}`;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function nextModeAfter(mode, focusCountCompleted) {
  if (mode === "focus") {
    const nextFocusCount = (focusCountCompleted + 1) % 4;
    const breakMode = nextFocusCount === 0 ? "long" : "short";
    return { nextMode: breakMode, nextFocusCount };
  }
  return { nextMode: "focus", nextFocusCount: focusCountCompleted };
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm0 18a8 8 0 118-8a8.01 8.01 0 01-8 8zm.5-13H11v6l5 3l1-1.73l-4-2.27z"
      />
    </svg>
  );
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function clampInt(n, min, max) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = safeJsonParse(raw);
    if (!data || typeof data !== "object") return null;

    const mode = data.mode === "focus" || data.mode === "short" || data.mode === "long" ? data.mode : "focus";
    const running = Boolean(data.running);
    const focusCountCompleted = clampInt(data.focusCountCompleted ?? 0, 0, 3);
    const modeSeconds = MODE_META[mode]?.seconds ?? MODE_META.focus.seconds;
    let secondsLeft = clampInt(data.secondsLeft ?? modeSeconds, 0, modeSeconds);

    const lastUpdatedMs = Number(data.lastUpdatedMs ?? 0);
    if (running && Number.isFinite(lastUpdatedMs) && lastUpdatedMs > 0) {
      const elapsed = Math.floor((Date.now() - lastUpdatedMs) / 1000);
      if (elapsed > 0) secondsLeft = Math.max(0, secondsLeft - elapsed);
    }

    return { mode, running, focusCountCompleted, secondsLeft };
  } catch {
    return null;
  }
}

function persistState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: state.mode,
        running: state.running,
        secondsLeft: state.secondsLeft,
        focusCountCompleted: state.focusCountCompleted,
        lastUpdatedMs: Date.now(),
      })
    );
  } catch {
    // ignore
  }
}

function loadSelectedTaskId() {
  try {
    const raw = localStorage.getItem(TASK_KEY);
    if (raw === null || raw === "" || raw === "none") return null;
    const id = Number.parseInt(raw, 10);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

function persistSelectedTaskId(id) {
  try {
    if (id === null) localStorage.setItem(TASK_KEY, "none");
    else localStorage.setItem(TASK_KEY, String(id));
  } catch {
    // ignore
  }
}

export default function PomodoroWidget({ currentTask, tasks = [], variant = "default" }) {
  const rootRef = useRef(null);
  const audioCtxRef = useRef(null);
  const finishHandledRef = useRef(false);

  const persisted = useRef(loadPersistedState());

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(() => persisted.current?.mode ?? "focus");
  const [secondsLeft, setSecondsLeft] = useState(() => persisted.current?.secondsLeft ?? MODE_META.focus.seconds);
  const [running, setRunning] = useState(() => Boolean(persisted.current?.running));
  const [focusCountCompleted, setFocusCountCompleted] = useState(() => persisted.current?.focusCountCompleted ?? 0);
  const [selectedTaskId, setSelectedTaskId] = useState(() => loadSelectedTaskId());

  const modeSeconds = MODE_META[mode]?.seconds ?? 0;
  const pillProgress = clamp01(1 - secondsLeft / Math.max(1, modeSeconds));
  const timeText = formatMMSS(secondsLeft);

  const ringSize = 136;
  const ringStroke = 10;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCx = ringSize / 2;
  const ringCy = ringSize / 2;
  const ringCircumference = 2 * Math.PI * ringR;
  const ringProgress = clamp01(1 - secondsLeft / Math.max(1, modeSeconds));
  const ringDashOffset = ringCircumference * (1 - ringProgress);

  function ensureAudioContext() {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }

  async function playBeep() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") await ctx.resume();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0);
      osc.stop(t0 + 0.13);
    } catch {
      // ignore audio failures (autoplay policy, etc.)
    }
  }

  function setModeAndReset(nextMode, { keepRunning = false } = {}) {
    const meta = MODE_META[nextMode] ?? MODE_META.focus;
    setMode(nextMode);
    setSecondsLeft(meta.seconds);
    setRunning(keepRunning);
    finishHandledRef.current = false;
  }

  function advance({ keepRunning } = {}) {
    const keep = typeof keepRunning === "boolean" ? keepRunning : running;
    if (mode === "focus") {
      const { nextMode, nextFocusCount } = nextModeAfter(mode, focusCountCompleted);
      setFocusCountCompleted(nextFocusCount);
      setModeAndReset(nextMode, { keepRunning: keep });
      return;
    }
    const { nextMode } = nextModeAfter(mode, focusCountCompleted);
    setModeAndReset(nextMode, { keepRunning: keep });
  }

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e) {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    persistState({ mode, running, secondsLeft, focusCountCompleted });
  }, [mode, running, secondsLeft, focusCountCompleted]);

  useEffect(() => {
    persistSelectedTaskId(selectedTaskId);
  }, [selectedTaskId]);

  useEffect(() => {
    if (selectedTaskId === null) return;
    const list = Array.isArray(tasks) ? tasks : [];
    const exists = list.some((t) => t && typeof t === "object" && t.id === selectedTaskId);
    if (!exists) setSelectedTaskId(null);
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) {
        const next = loadPersistedState();
        if (!next) return;
        setMode(next.mode);
        setRunning(next.running);
        setSecondsLeft(next.secondsLeft);
        setFocusCountCompleted(next.focusCountCompleted);
        return;
      }
      if (e.key === TASK_KEY) {
        setSelectedTaskId(loadSelectedTaskId());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (secondsLeft > 0) {
      finishHandledRef.current = false;
      return;
    }
    if (finishHandledRef.current) return;
    finishHandledRef.current = true;

    // Auto-advance and keep running.
    (async () => {
      await playBeep();
      if (mode === "focus") {
        const { nextMode, nextFocusCount } = nextModeAfter(mode, focusCountCompleted);
        setFocusCountCompleted(nextFocusCount);
        setModeAndReset(nextMode, { keepRunning: true });
        return;
      }
      const { nextMode } = nextModeAfter(mode, focusCountCompleted);
      setModeAndReset(nextMode, { keepRunning: true });
    })();
  }, [secondsLeft, mode, focusCountCompleted, playBeep, setModeAndReset]);

  const modeLabel = MODE_META[mode]?.label ?? "Focus";
  const taskOptions = Array.isArray(tasks) ? tasks : [];
  const selectedTask =
    selectedTaskId === null ? null : taskOptions.find((t) => t && typeof t === "object" && t.id === selectedTaskId);
  const taskLabel = selectedTask?.title?.trim?.() || (currentTask ?? "").trim() || "No task selected";
  const rootClass =
    variant === "floating" ? "tm-pomo tm-pomoFloating" : variant === "sidebar" ? "tm-pomo tm-pomoSidebar" : "tm-pomo";

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        className={open ? "tm-pomoPill tm-pomoPillOpen" : "tm-pomoPill"}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="tm-pomoPillLeft">
          {running ? (
            <span className="tm-pomoPillTime">{timeText}</span>
          ) : (
            <span className="tm-pomoPillIcon" aria-label="Timer idle">
              <IconClock className="tm-pomoClockIcon" />
            </span>
          )}
          <span className="tm-pomoPillMode">{modeLabel}</span>
        </span>
        <span className="tm-pomoPillRight">
          <span className={running ? "tm-pomoPillDot tm-pomoPillDotOn" : "tm-pomoPillDot"} />
        </span>
        <span className="tm-pomoPillBar" aria-hidden="true">
          <span className="tm-pomoPillBarFill" style={{ width: `${pillProgress * 100}%` }} />
        </span>
      </button>

      {open ? (
        <div className="tm-pomoPopover" role="dialog" aria-label="Pomodoro timer">
          <div className="tm-pomoModeRow" role="tablist" aria-label="Timer mode">
            <button
              type="button"
              className={mode === "focus" ? "tm-pomoModeBtn tm-pomoModeBtnActive" : "tm-pomoModeBtn"}
              onClick={() => setModeAndReset("focus", { keepRunning: false })}
            >
              Focus 25m
            </button>
            <button
              type="button"
              className={mode === "short" ? "tm-pomoModeBtn tm-pomoModeBtnActive" : "tm-pomoModeBtn"}
              onClick={() => setModeAndReset("short", { keepRunning: false })}
            >
              Short 5m
            </button>
            <button
              type="button"
              className={mode === "long" ? "tm-pomoModeBtn tm-pomoModeBtnActive" : "tm-pomoModeBtn"}
              onClick={() => setModeAndReset("long", { keepRunning: false })}
            >
              Long 15m
            </button>
          </div>

          <div className="tm-pomoRingWrap">
            <svg
              className="tm-pomoRing"
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              role="img"
              aria-label={`${modeLabel}, ${timeText} remaining`}
            >
              <circle
                cx={ringCx}
                cy={ringCy}
                r={ringR}
                stroke="var(--tm-pomo-ringTrack)"
                strokeWidth={ringStroke}
                fill="none"
              />
              <circle
                cx={ringCx}
                cy={ringCy}
                r={ringR}
                stroke={ACCENT}
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                strokeDashoffset={ringDashOffset}
                transform={`rotate(-90 ${ringCx} ${ringCy})`}
              />
            </svg>
            <div className="tm-pomoRingText">
              <div className="tm-pomoRingTime">{timeText}</div>
              <div className="tm-pomoRingLabel">{modeLabel}</div>
            </div>
          </div>

          <div className="tm-pomoControls" aria-label="Timer controls">
            <button
              className="tm-pomoCtrlBtn tm-pomoCtrlBtnPrimary"
              type="button"
              onClick={async () => {
                await playBeep(); // primes audio context on first interaction
                setRunning((v) => !v);
              }}
            >
              {running ? "Pause" : "Sart"}
            </button>
            <button
              className="tm-pomoCtrlBtn"
              type="button"
              onClick={() => setModeAndReset(mode, { keepRunning: false })}
            >
              Restart
            </button>
            <button className="tm-pomoCtrlBtn" type="button" onClick={() => advance({ keepRunning: running })}>
              Skip
            </button>
          </div>

          <div className="tm-pomoDots" aria-label="Pomodoro cycle progress">
            {Array.from({ length: 4 }).map((_, i) => {
              const on = i < focusCountCompleted;
              return (
                <span
                  key={i}
                  className={on ? "tm-pomoDot tm-pomoDotOn" : "tm-pomoDot"}
                  title={on ? "Completed" : "Pending"}
                  aria-hidden="true"
                />
              );
            })}
          </div>

          <div className="tm-pomoFooter" title={taskLabel}>
            <span className="tm-pomoFooterLabel">Task</span>
            <select
              className="tm-pomoTaskSelect"
              aria-label="Pomodoro task"
              value={selectedTaskId === null ? "none" : String(selectedTaskId)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "none") setSelectedTaskId(null);
                else {
                  const id = Number.parseInt(v, 10);
                  setSelectedTaskId(Number.isFinite(id) ? id : null);
                }
              }}
            >
              <option value="none">None</option>
              {taskOptions.map((t) => {
                if (!t || typeof t !== "object") return null;
                const id = t.id;
                const title = String(t.title ?? "").trim();
                if (!Number.isFinite(id) || title === "") return null;
                return (
                  <option key={id} value={String(id)}>
                    {title}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
