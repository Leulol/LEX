export default function TaskFilters({ filter, onChangeFilter }) {
  return (
    <div className="tm-seg" role="tablist" aria-label="Filter tasks">
      <button
        className={filter === "all" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"}
        onClick={() => onChangeFilter("all")}
        type="button"
        role="tab"
        aria-selected={filter === "all"}
      >
        All
      </button>
      <button
        className={filter === "active" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"}
        onClick={() => onChangeFilter("active")}
        type="button"
        role="tab"
        aria-selected={filter === "active"}
      >
        Active
      </button>
      <button
        className={filter === "done" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"}
        onClick={() => onChangeFilter("done")}
        type="button"
        role="tab"
        aria-selected={filter === "done"}
      >
        Done
      </button>
    </div>
  );
}

