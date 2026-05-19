import { useMemo, useRef, useState } from "react";
import "./App.css";
import TasksModule from "./modules/TasksModule.jsx";
import PlannerModule from "./modules/PlannerModule.jsx";
import JournalModule from "./modules/JournalModule.jsx";

export default function App() {
  const taskInputRef = useRef(null);
  const [activeModule, setActiveModule] = useState("tasks"); // tasks | planner | journal

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
    <div className="tm-shell">
      <nav className="tm-nav">
        <div className="tm-navInner">
          <div className="tm-logo" aria-label="App logo">
            <img className="tm-logoImg" src="/lex-logo.png" alt="LEX logo" />
            <div className="tm-logoText">LEX</div>
          </div>

          <p className="tm-date">{todayLabel}</p>

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
        </div>
      </nav>

      <main className="tm-card">
        <div className="tm-hero tm-heroGlobal" aria-label="App hero">
          <div className="tm-mainhero">
            <h1 className="tm-heroTitle">NEXUS</h1>
            <p className="tm-heroSub">Fucking Do IT</p>
          </div>
          <div className="tm-heromiddle" />
        </div>

        <div className="tm-tabs" role="tablist" aria-label="Modules">
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === "tasks"}
            className={activeModule === "tasks" ? "tm-tabBtn tm-tabBtnActive" : "tm-tabBtn"}
            onClick={() => setActiveModule("tasks")}
          >
            Tasks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === "planner"}
            className={activeModule === "planner" ? "tm-tabBtn tm-tabBtnActive" : "tm-tabBtn"}
            onClick={() => setActiveModule("planner")}
          >
            Planned
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === "journal"}
            className={activeModule === "journal" ? "tm-tabBtn tm-tabBtnActive" : "tm-tabBtn"}
            onClick={() => setActiveModule("journal")}
          >
            Journal
          </button>
        </div>

        {activeModule === "tasks" ? <TasksModule inputRef={taskInputRef} /> : null} {/*Need to make <> to refer to the imported function*/}
        {activeModule === "planner" ? <PlannerModule /> : null}
        {activeModule === "journal" ? <JournalModule /> : null}
      </main>
    </div>
  );
}
