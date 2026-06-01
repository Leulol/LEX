import "./Sidebar.css";
import PomodoroWidget from "../PomodoroWidget";

function IconTasks(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>{/*Image for the icons*/}
      <path
        fill="currentColor"
        d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.4L9 16.2z"
      />
    </svg>
  );
}

function IconPlanned(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M7 2h2v2h6V2h2v2h3c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h3V2zm14 7H3v12h18V9z"
      />
    </svg>
  );
}

function IconJournal(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M18 2H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H8V4h10v16zM4 4h2v16H4V4z"
      />
    </svg>
  );
}
{/*Loads the icons on the sidebar*/}
const NAV_ITEMS = [
  { key: "tasks", label: "Tasks", Icon: IconTasks },
  { key: "planner", label: "Planned", Icon: IconPlanned },
  { key: "journal", label: "Journal", Icon: IconJournal },
];

function IconChevron(props) { {/*the 3 line image*/}
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M9.29 6.71a1 1 0 011.42 0L16 12l-5.29 5.29a1 1 0 01-1.42-1.42L13.17 12 9.29 8.12a1 1 0 010-1.41z" />
    </svg>
  );
}

export default function Sidebar({
  activeModule,
  onChangeModule,
  pomodoroTaskLabel = "",
  pomodoroTasks = [],
  expanded = false,
  onToggleExpanded,
}) {
  const rootClass = expanded ? "tm-sidebar tm-sidebarExpanded" : "tm-sidebar";
  return (
    <aside className={rootClass} aria-label="Primary">
      <button
        type="button"
        className="tm-sidebarToggle"
        onClick={() => onToggleExpanded?.()}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        title={expanded ? "Collapse" : "Expand"}
      >
        <IconChevron className={expanded ? "tm-sidebarToggleIcon tm-sidebarToggleIconExpanded" : "tm-sidebarToggleIcon"} />
      </button>

      <div className="tm-sidebarTop" role="navigation" aria-label="Modules">
        {NAV_ITEMS.map(({ key, label, Icon }) => { {/*generate the key is the section name*/}
          const active = activeModule === key;
          return (
            <button
              key={key}
              type="button"
              className={active ? "tm-sidebarItem tm-sidebarItemActive" : "tm-sidebarItem"}
              aria-current={active ? "page" : undefined}
              onClick={() => onChangeModule?.(key)}
              title={label}
            >
              <span className="tm-sidebarPillWrap" aria-hidden="true">
                <span className={active ? "tm-sidebarPill tm-sidebarPillActive" : "tm-sidebarPill"}>
                  <Icon className="tm-sidebarIcon" />
                </span>
              </span>
              <span className="tm-sidebarLabel">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="tm-sidebarBottom" aria-label="Pomodoro">
        <PomodoroWidget currentTask={pomodoroTaskLabel} tasks={pomodoroTasks} variant="sidebar" />
      </div>
    </aside>
  );
}
