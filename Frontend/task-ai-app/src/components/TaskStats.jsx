export default function TaskStats({ totalCount, remainingCount, completedCount }) {
  return (
    <div className="tm-pills" aria-label="Task stats">
      <span className="tm-pill">
        Total <b>{totalCount}</b>
      </span>
      <span className="tm-pill">
        Remaining <b>{remainingCount}</b>
      </span>
      <span className="tm-pill">
        Done <b>{completedCount}</b>
      </span>
    </div>
  );
}

