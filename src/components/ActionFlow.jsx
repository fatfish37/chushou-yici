import { useMemo, useState } from "react";
import { ACTION_MODES } from "../data/options";
import { generateCard, generateDowngradedAction } from "../utils/generators";
import ActionCard from "./ActionCard";
import FeedbackRecorder from "./FeedbackRecorder";
import ModeSelect from "./ModeSelect";
import Timer from "./Timer";

const emptyForm = {
  stuckReason: "",
  stuckReasonOther: "",
  currentIdea: "",
  targetPerson: "",
  targetRelation: "",
  targetActionScene: "",
  targetActionSceneOther: "",
  minimumRequest: "",
  minimumRequestOther: "",
  minimumPublishVersion: "",
  minimumPublishVersionOther: "",
  minimumOfflineVersion: "",
  minimumOfflineVersionOther: "",
};

const quickIdeaPlaceholder = [
  "我想找学校老师聊一下高校创作者合作计划。",
  "我想发一条关于过度优化的朋友圈。",
  "我想找供应商问一下样品价格。",
].join("\n");

const quickDefaults = {
  person: {
    stuckReason: "我卡住了",
    minimumRequest: "这事你第一反应值得继续吗？",
  },
  publish: {
    stuckReason: "我卡住了",
    targetActionScene: "公开/提交一个动作",
    minimumPublishVersion: "只发一个最低版本",
  },
  offline: {
    stuckReason: "我卡住了",
    targetActionScene: "去做一个现实动作",
    minimumOfflineVersion: "只完成第一步",
  },
};

export default function ActionFlow({
  activeIdea,
  activeRound,
  onCancel,
  onCreateRound,
  onMarkDone,
  onDowngrade,
  onAddFeedback,
}) {
  const [mode, setMode] = useState(activeRound?.actionMode || "");
  const [isDetailed, setIsDetailed] = useState(Boolean(activeRound));
  const [startedAt, setStartedAt] = useState(Date.now());
  const [form, setForm] = useState(() =>
    activeRound
      ? {
          ...emptyForm,
          stuckReason: activeRound.stuckReason || "",
          currentIdea: activeRound.currentIdea || "",
          targetPerson: activeRound.targetPerson || "",
          targetRelation: activeRound.targetRelation || "",
          targetActionScene: activeRound.targetActionScene || "",
          minimumRequest: activeRound.minimumRequest || "",
          minimumPublishVersion: activeRound.minimumPublishVersion || "",
          minimumOfflineVersion: activeRound.minimumOfflineVersion || "",
        }
      : emptyForm,
  );
  const [round, setRound] = useState(activeRound || null);
  const modeConfig = mode ? ACTION_MODES[mode] : null;

  const canGenerate = useMemo(() => {
    if (!mode) return false;
    if (!form.stuckReason || !form.currentIdea.trim()) return false;
    if (mode === "person") {
      return Boolean(
        form.targetPerson.trim() &&
          form.targetRelation.trim() &&
          form.minimumRequest,
      );
    }
    if (mode === "publish") {
      return Boolean(form.targetActionScene && form.minimumPublishVersion);
    }
    return Boolean(form.targetActionScene && form.minimumOfflineVersion);
  }, [form, mode]);

  const canGenerateQuick = useMemo(() => {
    return Boolean(mode && form.currentIdea.trim());
  }, [form.currentIdea, mode]);

  function selectMode(nextMode) {
    setMode(nextMode);
    setStartedAt(Date.now());
    setRound(null);
    setForm((current) => ({
      ...emptyForm,
      currentIdea: current.currentIdea,
    }));
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resolveOther(value, other) {
    return value === "其他" ? other.trim() || "其他" : value;
  }

  function normalizeForm() {
    return {
      stuckReason: resolveOther(form.stuckReason, form.stuckReasonOther),
      currentIdea: form.currentIdea.trim(),
      targetPerson: form.targetPerson.trim(),
      targetRelation: form.targetRelation.trim(),
      targetActionScene: resolveOther(
        form.targetActionScene,
        form.targetActionSceneOther,
      ),
      minimumRequest: resolveOther(
        form.minimumRequest,
        form.minimumRequestOther,
      ),
      minimumPublishVersion: resolveOther(
        form.minimumPublishVersion,
        form.minimumPublishVersionOther,
      ),
      minimumOfflineVersion: resolveOther(
        form.minimumOfflineVersion,
        form.minimumOfflineVersionOther,
      ),
    };
  }

  function createRoundFromForm(selectedMode, normalized) {
    const generatedCard = generateCard(selectedMode, normalized);
    const nextRound = {
      id: crypto.randomUUID(),
      actionMode: selectedMode,
      stuckReason: normalized.stuckReason,
      currentIdea: normalized.currentIdea,
      targetPerson: normalized.targetPerson || undefined,
      targetRelation: normalized.targetRelation || undefined,
      targetActionScene: normalized.targetActionScene || undefined,
      minimumRequest:
        selectedMode === "person" ? normalized.minimumRequest : undefined,
      minimumPublishVersion:
        selectedMode === "publish" ? normalized.minimumPublishVersion : undefined,
      minimumOfflineVersion:
        selectedMode === "offline" ? normalized.minimumOfflineVersion : undefined,
      generatedCard,
      resultStatus: null,
      notDoneReason: "",
      downgradedAction: "",
      createdAt: new Date().toISOString(),
      completedAt: "",
      feedbackRecords: [],
    };

    const savedRound = onCreateRound(nextRound);
    setRound(savedRound);
  }

  function submitRound(event) {
    event.preventDefault();
    if (!canGenerate || !mode) return;

    createRoundFromForm(mode, normalizeForm());
  }

  function submitQuickRound(event) {
    event.preventDefault();
    if (!canGenerateQuick || !mode) return;

    const defaults = quickDefaults[mode];
    createRoundFromForm(mode, {
      stuckReason: defaults.stuckReason,
      currentIdea: form.currentIdea.trim(),
      targetPerson: "",
      targetRelation: "",
      targetActionScene: defaults.targetActionScene || "",
      minimumRequest: defaults.minimumRequest || "",
      minimumPublishVersion: defaults.minimumPublishVersion || "",
      minimumOfflineVersion: defaults.minimumOfflineVersion || "",
    });
  }

  function handleDowngrade() {
    if (!round) return;
    const nextDowngrade = generateDowngradedAction(mode, {
      ...normalizeForm(),
      minimumRequest: round.minimumRequest,
      minimumPublishVersion: round.minimumPublishVersion,
      minimumOfflineVersion: round.minimumOfflineVersion,
      targetActionScene: round.targetActionScene,
    });
    const updated = onDowngrade(round.id, nextDowngrade);
    setRound(updated);
  }

  function handleDone() {
    if (!round) return;
    const updated = onMarkDone(round.id);
    setRound(updated);
  }

  function handleAddFeedback(roundId, feedback) {
    onAddFeedback(roundId, feedback);
    setRound((current) =>
      current?.id === roundId
        ? {
            ...current,
            feedbackRecords: [...(current.feedbackRecords || []), feedback],
          }
        : current,
    );
  }

  return (
    <section className="flowPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">出手流程</p>
          <h2>{activeIdea ? `继续推进：${activeIdea.name}` : "选择现实动作"}</h2>
        </div>
        <button className="ghostButton" onClick={onCancel}>
          关闭
        </button>
      </div>

      {!round && !isDetailed && (
        <form className="quickFlow" onSubmit={submitQuickRound}>
          <label className="fieldBlock quickIdeaInput">
            <span>我想让什么发生？</span>
            <textarea
              value={form.currentIdea}
              onChange={(event) =>
                updateField("currentIdea", event.target.value)
              }
              rows="3"
              placeholder={quickIdeaPlaceholder}
            />
          </label>

          <div className="fieldBlock">
            <span>选择现实动作类型</span>
            <div className="modeGrid compactModeGrid">
              {Object.values(ACTION_MODES).map((item) => (
                <button
                  className={`modeButton compactModeButton ${
                    mode === item.id ? "modeButtonActive" : ""
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => selectMode(item.id)}
                >
                  <span>{item.title}</span>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="formActions">
            <button className="primaryButton" disabled={!canGenerateQuick}>
              生成最低动作
            </button>
            <button
              className="ghostButton"
              type="button"
              onClick={() => setIsDetailed(true)}
            >
              展开详细设置
            </button>
          </div>
        </form>
      )}

      {!round && isDetailed && !mode && <ModeSelect onSelect={selectMode} />}

      {modeConfig && isDetailed && !round && (
        <>
          <Timer
            startedAt={startedAt}
            minutes={modeConfig.minutes}
            message={modeConfig.timerText}
            isDone={round?.resultStatus === "done"}
          />

          <form className="flowForm" onSubmit={submitRound}>
            <FieldSelect
              label="选择卡住原因"
              value={form.stuckReason}
              options={modeConfig.stuckReasons}
              onChange={(value) => updateField("stuckReason", value)}
            />
            {form.stuckReason === "其他" && (
              <FieldInput
                label="其他原因"
                value={form.stuckReasonOther}
                onChange={(value) => updateField("stuckReasonOther", value)}
              />
            )}

            <label className="fieldBlock">
              <span>当前想法</span>
              <small>{modeConfig.ideaPrompt}</small>
              <textarea
                value={form.currentIdea}
                onChange={(event) =>
                  updateField("currentIdea", event.target.value)
                }
                rows="4"
                placeholder={modeConfig.examples[0]}
              />
            </label>

            <div className="examples">
              {modeConfig.examples.map((example) => (
                <button
                  className="exampleButton"
                  type="button"
                  key={example}
                  onClick={() => updateField("currentIdea", example)}
                >
                  {example}
                </button>
              ))}
            </div>

            {mode === "person" && (
              <>
                <FieldInput
                  label="我要发给谁？"
                  value={form.targetPerson}
                  onChange={(value) => updateField("targetPerson", value)}
                  placeholder="例如：做过高校渠道的朋友"
                />
                <FieldInput
                  label="他/她和这件事有什么关系？"
                  value={form.targetRelation}
                  onChange={(value) => updateField("targetRelation", value)}
                  placeholder="例如：他做过校园合作，能判断方向是否靠谱"
                />
                <FieldSelect
                  label="最小外部请求"
                  value={form.minimumRequest}
                  options={modeConfig.minimumRequests}
                  onChange={(value) => updateField("minimumRequest", value)}
                />
                {form.minimumRequest === "其他" && (
                  <FieldInput
                    label="其他请求"
                    value={form.minimumRequestOther}
                    onChange={(value) =>
                      updateField("minimumRequestOther", value)
                    }
                  />
                )}
              </>
            )}

            {mode !== "person" && (
              <>
                <FieldSelect
                  label={mode === "publish" ? "动作场景" : "现实动作场景"}
                  value={form.targetActionScene}
                  options={modeConfig.scenes}
                  onChange={(value) => updateField("targetActionScene", value)}
                />
                {form.targetActionScene === "其他" && (
                  <FieldInput
                    label="其他场景"
                    value={form.targetActionSceneOther}
                    onChange={(value) =>
                      updateField("targetActionSceneOther", value)
                    }
                  />
                )}
              </>
            )}

            {mode === "publish" && (
              <>
                <FieldSelect
                  label="最低可发布/提交版本"
                  value={form.minimumPublishVersion}
                  options={modeConfig.minimumVersions}
                  onChange={(value) =>
                    updateField("minimumPublishVersion", value)
                  }
                />
                {form.minimumPublishVersion === "其他" && (
                  <FieldInput
                    label="其他版本"
                    value={form.minimumPublishVersionOther}
                    onChange={(value) =>
                      updateField("minimumPublishVersionOther", value)
                    }
                  />
                )}
              </>
            )}

            {mode === "offline" && (
              <>
                <FieldSelect
                  label="最低动作版本"
                  value={form.minimumOfflineVersion}
                  options={modeConfig.minimumVersions}
                  onChange={(value) =>
                    updateField("minimumOfflineVersion", value)
                  }
                />
                {form.minimumOfflineVersion === "其他" && (
                  <FieldInput
                    label="其他版本"
                    value={form.minimumOfflineVersionOther}
                    onChange={(value) =>
                      updateField("minimumOfflineVersionOther", value)
                    }
                  />
                )}
              </>
            )}

            <div className="formActions">
              <button className="primaryButton" disabled={!canGenerate}>
                生成出手卡
              </button>
            </div>
          </form>
        </>
      )}

      {modeConfig && round && (
        <>
          <Timer
            startedAt={startedAt}
            minutes={modeConfig.minutes}
            message={modeConfig.timerText}
            isDone={round?.resultStatus === "done"}
          />

          <div className="generatedArea">
            {round.resultStatus !== "done" && (
              <ResultButtons
                className="resultButtons resultButtonsTop"
                onDone={handleDone}
                onDowngrade={handleDowngrade}
              />
            )}

            <ActionCard items={round.generatedCard} />

            {round.downgradedAction && (
              <div className="downgradeBox">
                <span>降级动作</span>
                <p>{round.downgradedAction}</p>
              </div>
            )}

            {round.resultStatus === "done" ? (
              <div className="doneBlock">
                <strong>已发生。</strong>
                <FeedbackRecorder
                  round={round}
                  onAddFeedback={handleAddFeedback}
                />
              </div>
            ) : (
              <ResultButtons
                className="resultButtons"
                onDone={handleDone}
                onDowngrade={handleDowngrade}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

function ResultButtons({ className, onDone, onDowngrade }) {
  return (
    <div className={className}>
      <button className="primaryButton" onClick={onDone}>
        已发生
      </button>
      <button className="secondaryButton" onClick={onDowngrade}>
        没做，帮我降级
      </button>
    </div>
  );
}

function FieldSelect({ label, value, options, onChange }) {
  return (
    <label className="fieldBlock">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">请选择</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldInput({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="fieldBlock">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
