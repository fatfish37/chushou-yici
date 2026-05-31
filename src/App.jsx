import { useMemo, useState } from "react";
import ActionFlow from "./components/ActionFlow";
import DataPanel from "./components/DataPanel";
import IdeaList from "./components/IdeaList";
import {
  createEmptyData,
  loadData,
  normalizeImport,
  saveData,
} from "./utils/storage";

function ideaNameFromRound(round) {
  const text = round.currentIdea.replace(/\s+/g, " ").trim();
  if (!text) return "未命名想法";
  return text.length > 32 ? `${text.slice(0, 32)}...` : text;
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [flowTargetId, setFlowTargetId] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState("");

  const sortedIdeas = useMemo(() => {
    return [...data.ideas].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [data.ideas]);

  const activeIdea =
    data.ideas.find((idea) => idea.id === flowTargetId) || null;

  function commit(nextData) {
    const saved = saveData(nextData);
    setData(saved);
    return saved;
  }

  function startNewFlow() {
    setFlowTargetId("new");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startRoundForIdea(ideaId) {
    setFlowTargetId(ideaId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createRound(round) {
    if (flowTargetId && flowTargetId !== "new") {
      commit({
        ...data,
        ideas: data.ideas.map((idea) =>
          idea.id === flowTargetId
            ? {
                ...idea,
                rounds: [...idea.rounds, round],
              }
            : idea,
        ),
      });
      return round;
    }

    const nextIdea = {
      id: crypto.randomUUID(),
      name: ideaNameFromRound(round),
      createdAt: new Date().toISOString(),
      status: "推进中",
      rounds: [round],
    };

    commit({
      ...data,
      ideas: [nextIdea, ...data.ideas],
    });
    setSelectedIdeaId(nextIdea.id);
    setFlowTargetId(nextIdea.id);
    return round;
  }

  function updateRound(roundId, updater) {
    let updatedRound = null;
    commit({
      ...data,
      ideas: data.ideas.map((idea) => ({
        ...idea,
        rounds: idea.rounds.map((round) => {
          if (round.id !== roundId) return round;
          updatedRound = updater(round);
          return updatedRound;
        }),
      })),
    });
    return updatedRound;
  }

  function markDone(roundId) {
    return updateRound(roundId, (round) => ({
      ...round,
      resultStatus: "done",
      completedAt: round.completedAt || new Date().toISOString(),
    }));
  }

  function downgrade(roundId, downgradedAction) {
    return updateRound(roundId, (round) => ({
      ...round,
      resultStatus: "not_done",
      notDoneReason: "用户选择降级动作",
      downgradedAction,
    }));
  }

  function addFeedback(roundId, feedback) {
    commit({
      ...data,
      ideas: data.ideas.map((idea) => ({
        ...idea,
        rounds: idea.rounds.map((round) =>
          round.id === roundId
            ? {
                ...round,
                feedbackRecords: [...(round.feedbackRecords || []), feedback],
              }
            : round,
        ),
      })),
    });
  }

  function updateIdeaStatus(ideaId, status) {
    commit({
      ...data,
      ideas: data.ideas.map((idea) =>
        idea.id === ideaId ? { ...idea, status } : idea,
      ),
    });
  }

  function importData(text) {
    const nextData = normalizeImport(text);
    commit(nextData);
    setSelectedIdeaId(nextData.ideas[0]?.id || "");
    setFlowTargetId("");
  }

  function clearData() {
    commit(createEmptyData());
    setSelectedIdeaId("");
    setFlowTargetId("");
  }

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <p className="eyebrow">本地优先行动工具</p>
          <h1>出手一次</h1>
          <p className="heroLine">没有现实发生，就不算进展。</p>
          <p className="heroCopy">
            发出去、交出去、投出去、发布出去。不要继续只在脑子里优化。
          </p>
        </div>
        <button className="primaryButton heroButton" onClick={startNewFlow}>
          我又卡住了，开始一次出手
        </button>
      </section>

      {flowTargetId && (
        <ActionFlow
          activeIdea={activeIdea}
          onCancel={() => setFlowTargetId("")}
          onCreateRound={createRound}
          onMarkDone={markDone}
          onDowngrade={downgrade}
          onAddFeedback={addFeedback}
        />
      )}

      <section className="listSection">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">想法</p>
            <h2>现实回路</h2>
          </div>
          <span className="countText">{sortedIdeas.length} 个想法</span>
        </div>

        <IdeaList
          ideas={sortedIdeas}
          selectedIdeaId={selectedIdeaId || sortedIdeas[0]?.id || ""}
          onSelectIdea={setSelectedIdeaId}
          onStartRound={startRoundForIdea}
          onUpdateIdeaStatus={updateIdeaStatus}
          onAddFeedback={addFeedback}
        />
      </section>

      <DataPanel data={data} onImport={importData} onClear={clearData} />
    </main>
  );
}
