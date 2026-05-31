import { useEffect, useMemo, useState } from "react";

export default function Timer({ startedAt, minutes, message, isDone }) {
  const duration = minutes * 60 * 1000;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (isDone) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isDone]);

  const remaining = Math.max(0, duration - (now - startedAt));
  const expired = remaining <= 0 && !isDone;

  const timeText = useMemo(() => {
    const total = Math.ceil(remaining / 1000);
    const min = String(Math.floor(total / 60)).padStart(2, "0");
    const sec = String(total % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }, [remaining]);

  return (
    <div className={`timer ${expired ? "timerExpired" : ""}`}>
      <div>
        <span className="timerLabel">倒计时</span>
        <strong>{timeText}</strong>
      </div>
      <p>
        {expired
          ? "你可能又开始优化了。请降级动作，或者现在让它发生。"
          : message}
      </p>
    </div>
  );
}
