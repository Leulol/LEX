import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import TasksModule from "./modules/TasksModule.jsx";
import PlannerModule from "./modules/PlannerModule.jsx";
import JournalModule from "./modules/JournalModule.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import PomodoroWidget from "./components/PomodoroWidget";

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

export default function App() {
  const taskInputRef = useRef(null);
  const [activeModule, setActiveModule] = useState("tasks"); // tasks | planner | journal
  const [pomodoroTaskLabel, setPomodoroTaskLabel] = useState("");
  const [pomodoroTasks, setPomodoroTasks] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem("tm-sidebar-expanded");
      if (saved === "1") return true;
      if (saved === "0") return false;
    } catch {
      // ignore
    }
    return false;
  });
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("tm-theme");
      return saved === "dark" || saved === "light" ? saved : "light";
    } catch {
      return "light";
    }
  });

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    try {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("tm-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("tm-sidebar-expanded", sidebarExpanded ? "1" : "0");
    } catch {
      // ignore
    }
  }, [sidebarExpanded]);

  const todayLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  return (
    <div className={sidebarExpanded ? "tm-shell tm-shellSidebarOpen" : "tm-shell"}>
      <div
        className={sidebarExpanded ? "tm-sidebarBackdrop tm-sidebarBackdropOn" : "tm-sidebarBackdrop"}
        aria-hidden="true"
        onClick={() => setSidebarExpanded(false)}
      />

      <div className="tm-mobilePomo" aria-label="Pomodoro (mobile)">
        <PomodoroWidget currentTask={pomodoroTaskLabel} tasks={pomodoroTasks} variant="floating" />
      </div>

      <Sidebar
        activeModule={activeModule}
        onChangeModule={setActiveModule}
        pomodoroTaskLabel={pomodoroTaskLabel}
        pomodoroTasks={pomodoroTasks}
        expanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded((v) => !v)}
      />

      <div className="tm-main">
        <nav className="tm-nav">
          <div className="tm-navInner">
            <button
              type="button"
              className="tm-mobileSidebarBtn"
              aria-label={sidebarExpanded ? "Close sidebar" : "Open sidebar"}
              title={sidebarExpanded ? "Close sidebar" : "Open sidebar"}
              onClick={() => setSidebarExpanded((v) => !v)}
            >
              <IconMenu className="tm-mobileSidebarIcon" />
            </button>

            <div className="tm-logo" aria-label="App logo">
              <img className="tm-logoImg" src="/lex-logo.png" alt="LEX logo" />
              <div className="tm-logoText">LEX</div>
            </div>

            <p className="tm-date">{todayLabel}</p>

            <div className="tm-navActions">
              {activeModule === "tasks" ? (
                <button
                  className="tm-newBtn"
                  type="button"
                  onClick={() => taskInputRef.current?.focus()}
                  title="Focus new task input"
                >
                  New Task
                </button>
              ) : (
                <div className="tm-navSpacer" />
              )}

              <button
                className={theme === "dark" ? "tm-themeBtn tm-themeBtnDark" : "tm-themeBtn tm-themeBtnLight"}
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle light/dark"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </nav>

        <main className="tm-content">
          <div className="tm-hero tm-heroGlobal" aria-label="App hero">
            <div className="tm-mainhero">
              <h1 className="tm-heroTitle">NEXUS</h1>
              <p className="tm-heroSub">Fucking Do IT</p>
            </div>
            <div className="tm-heromiddle" />
          </div>

          <div className="tm-surface" aria-label="App content">
            {activeModule === "tasks" ? ( 
              <TasksModule
                inputRef={taskInputRef}
                onPomodoroTaskChange={setPomodoroTaskLabel}
                onTasksChange={setPomodoroTasks}
              />
            ) : null}
            {activeModule === "planner" ? <PlannerModule /> : null}
            {activeModule === "journal" ? <JournalModule /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
