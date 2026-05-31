import { useState } from "react";
import { FEEDBACK_TYPES } from "../data/options";

const quickFeedback = [
  {
    label: "没反应",
    feedbackType: "无回复/无信号",
    hasSignal: false,
  },
  {
    label: "有反应",
    feedbackType: "模糊兴趣",
    hasSignal: true,
  },
  {
    label: "有下一步",
    feedbackType: "同意下一步",
    hasSignal: true,
  },
];

export default function FeedbackRecorder({ round, onAddFeedback }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    signalContent: "",
    feedbackType: "明确反馈",
    learned: "",
    nextAction: "",
  });

  function quickAdd(item) {
    onAddFeedback(round.id, {
      id: crypto.randomUUID(),
      roundId: round.id,
      hasSignal: item.hasSignal,
      signalContent: "",
      feedbackType: item.feedbackType,
      learned: "",
      nextAction: "",
      createdAt: new Date().toISOString(),
    });
  }

  function submitDetail(event) {
    event.preventDefault();
    onAddFeedback(round.id, {
      id: crypto.randomUUID(),
      roundId: round.id,
      hasSignal: form.feedbackType !== "无回复/无信号",
      signalContent: form.signalContent.trim(),
      feedbackType: form.feedbackType,
      learned: form.learned.trim(),
      nextAction: form.nextAction.trim(),
      createdAt: new Date().toISOString(),
    });
    setForm({
      signalContent: "",
      feedbackType: "明确反馈",
      learned: "",
      nextAction: "",
    });
    setExpanded(false);
  }

  return (
    <div className="feedbackPanel">
      <div className="feedbackQuick">
        {quickFeedback.map((item) => (
          <button
            className="secondaryButton"
            key={item.label}
            onClick={() => quickAdd(item)}
          >
            {item.label}
          </button>
        ))}
        <button className="ghostButton" onClick={() => setExpanded(!expanded)}>
          {expanded ? "收起" : "补充详细内容"}
        </button>
      </div>

      {expanded && (
        <form className="feedbackForm" onSubmit={submitDetail}>
          <label className="fieldBlock">
            <span>信号内容</span>
            <textarea
              rows="3"
              value={form.signalContent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  signalContent: event.target.value,
                }))
              }
            />
          </label>
          <label className="fieldBlock">
            <span>反馈类型</span>
            <select
              value={form.feedbackType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  feedbackType: event.target.value,
                }))
              }
            >
              {FEEDBACK_TYPES.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="fieldBlock">
            <span>我学到了什么</span>
            <textarea
              rows="3"
              value={form.learned}
              onChange={(event) =>
                setForm((current) => ({ ...current, learned: event.target.value }))
              }
            />
          </label>
          <label className="fieldBlock">
            <span>下一步动作</span>
            <textarea
              rows="3"
              value={form.nextAction}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nextAction: event.target.value,
                }))
              }
            />
          </label>
          <button className="primaryButton">保存反馈</button>
        </form>
      )}
    </div>
  );
}
