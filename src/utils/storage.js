export const STORAGE_KEY = "chushou-yici:v1";

export function createEmptyData() {
  return {
    version: 1,
    ideas: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.ideas)) return createEmptyData();
    return {
      version: parsed.version || 1,
      ideas: parsed.ideas,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return createEmptyData();
  }
}

export function saveData(data) {
  const nextData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  return nextData;
}

export function normalizeImport(payload) {
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  const ideas = Array.isArray(parsed) ? parsed : parsed?.ideas;

  if (!Array.isArray(ideas)) {
    throw new Error("导入文件里没有找到 ideas 数组。");
  }

  return {
    version: 1,
    ideas: ideas.map((idea) => ({
      id: idea.id || crypto.randomUUID(),
      name: idea.name || "未命名想法",
      createdAt: idea.createdAt || new Date().toISOString(),
      status: idea.status || "推进中",
      rounds: Array.isArray(idea.rounds) ? idea.rounds : [],
    })),
    updatedAt: new Date().toISOString(),
  };
}
