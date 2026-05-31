import { ACTION_MODES, IDEA_STATUSES } from "../data/options";
import { formatDateTime, getLoopStatus } from "../utils/status";
import ActionCard from "./ActionCard";
import FeedbackRecorder from "./FeedbackRecorder";

export default function IdeaList({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  onStartRound,
  onUpdateIdeaStatus,
  onAddFeedback,
}) {
  if (ideas.length === 0) {
    return (
      <section className="emptyState">
        <p>还没有想法离开脑子。</p>
      </section>
    );
  }

  const selectedIdea =
    ideas.find((idea) => idea.id === selectedIdeaId) || ideas[0] || null;

  return (
    <section className="ideasLayout">
      <div className="ideasRail">
        {ideas.map((idea) => {
          const loop = getLoopStatus(idea);
          const isActive = idea.id === selectedIdea?.id;
          return (
            <button
              className={`ideaRow ${isActive ? "ideaRowActive" : ""}`}
              key={idea.id}
              onClick={() => onSelectIdea(idea.id)}
            >
              <span>{idea.name}</span>
              <small>{loop.label}</small>
            </button>
          );
        })}
      </div>

      {selectedIdea && (
        <IdeaDetail
          idea={selectedIdea}
          onStartRound={() => onStartRound(selectedIdea.id)}
          onUpdateIdeaStatus={onUpdateIdeaStatus}
          onAddFeedback={onAddFeedback}
        />
      )}
    </section>
  );
}

function IdeaDetail({ idea, onStartRound, onUpdateIdeaStatus, onAddFeedback }) {
  const loop = getLoopStatus(idea);
  const rounds = [...idea.rounds].reverse();

  return (
    <div className="ideaDetail">
      <div className="sectionHeader compactHeader">
        <div>
          <p className="eyebrow">{loop.label}</p>
          <h2>{idea.name}</h2>
          <p>{loop.description}</p>
        </div>
        <button className="primaryButton" onClick={onStartRound}>
          再出手一次
        </button>
      </div>

      <label className="statusSelect">
        <span>想法状态</span>
        <select
          value={idea.status}
          onChange={(event) => onUpdateIdeaStatus(idea.id, event.target.value)}
        >
          {IDEA_STATUSES.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <div className="roundList">
        {rounds.map((round) => (
          <article className="roundItem" key={round.id}>
            <div className="roundHeader">
              <div>
                <span className="tag">
                  {ACTION_MODES[round.actionMode]?.title || "出手"}
                </span>
                <span className="muted">{formatDateTime(round.createdAt)}</span>
              </div>
              <strong>
                {round.resultStatus === "done" ? "已发生" : "还没发生"}
              </strong>
            </div>

            <p className="roundIdea">{round.currentIdea}</p>
            <ActionCard items={round.generatedCard || []} />

            {round.downgradedAction && (
              <div className="downgradeBox">
                <span>降级动作</span>
                <p>{round.downgradedAction}</p>
              </div>
            )}

            {round.resultStatus === "done" && (
              <>
                <FeedbackRecorder round={round} onAddFeedback={onAddFeedback} />
                <FeedbackList records={round.feedbackRecords || []} />
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function FeedbackList({ records }) {
  if (records.length === 0) return null;

  return (
    <div className="feedbackList">
      {records.map((record) => (
        <div className="feedbackItem" key={record.id}>
          <div>
            <strong>{record.feedbackType}</strong>
            <span>{formatDateTime(record.createdAt)}</span>
          </div>
          {record.signalContent && <p>{record.signalContent}</p>}
          {record.learned && <p>学到：{record.learned}</p>}
          {record.nextAction && <p>下一步：{record.nextAction}</p>}
        </div>
      ))}
    </div>
  );
}
