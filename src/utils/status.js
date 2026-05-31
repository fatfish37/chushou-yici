import { LOOP_STATUSES } from "../data/options";

const exchangeTypes = ["资源承诺", "付费成交", "其他真实交换"];
const nextTypes = ["同意下一步", "有面试邀约", "有合作意向"];
const concreteFeedbackTypes = [
  "拒绝",
  "明确反馈",
  "有试用反馈",
  "有咨询",
  "有投递状态变化",
];

export function getLoopStatus(idea) {
  const rounds = Array.isArray(idea.rounds) ? idea.rounds : [];
  if (rounds.length === 0) return LOOP_STATUSES.brain;

  const feedback = rounds.flatMap((round) =>
    Array.isArray(round.feedbackRecords) ? round.feedbackRecords : [],
  );

  if (feedback.some((item) => exchangeTypes.includes(item.feedbackType))) {
    return LOOP_STATUSES.exchange;
  }

  if (
    feedback.some(
      (item) => nextTypes.includes(item.feedbackType) || item.nextAction,
    )
  ) {
    return LOOP_STATUSES.next;
  }

  if (
    feedback.some(
      (item) =>
        concreteFeedbackTypes.includes(item.feedbackType) ||
        item.signalContent ||
        item.learned,
    )
  ) {
    return LOOP_STATUSES.feedback;
  }

  if (feedback.some((item) => item.hasSignal)) {
    return LOOP_STATUSES.signal;
  }

  if (rounds.some((round) => round.resultStatus === "done")) {
    return LOOP_STATUSES.happened;
  }

  return LOOP_STATUSES.card;
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
