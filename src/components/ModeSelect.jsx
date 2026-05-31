import { ACTION_MODES } from "../data/options";

export default function ModeSelect({ onSelect }) {
  return (
    <div className="modeGrid">
      {Object.values(ACTION_MODES).map((mode) => (
        <button
          className="modeButton"
          key={mode.id}
          onClick={() => onSelect(mode.id)}
        >
          <span>{mode.title}</span>
          <small>{mode.description}</small>
        </button>
      ))}
    </div>
  );
}
