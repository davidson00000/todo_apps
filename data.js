// data.js — Multi-project schema + utilities
// Schema:
//   state = {
//     projects: { [id]: { id, name, hue, createdAt } },
//     projectOrder: [id, ...],
//     activeProjectId: id,
//     tasksByProject: { [projectId]: Task[] },
//   }
//
// Task:
//   { id, title, start, end, progress, hours, parent, deps, priority, milestone }

window.PRIORITY_OPTS = [
  { value: 'high', label: '高' },
  { value: 'med',  label: '中' },
  { value: 'low',  label: '低' },
];

window.PROJECT_HUES = [295, 165, 35, 240, 0, 120, 60, 200, 320];

// Empty state for first-time users
window.makeInitialState = function () {
  const id = 'p_' + Math.random().toString(36).slice(2, 9);
  return {
    projects: {
      [id]: { id, name: 'マイプロジェクト', hue: 295, createdAt: Date.now() },
    },
    projectOrder: [id],
    activeProjectId: id,
    tasksByProject: { [id]: [] },
  };
};

// Sample data (only used if user wants to seed)
window.SAMPLE_PROJECTS = (() => {
  const pid = 'p_sample_q2';
  return {
    projects: {
      [pid]: { id: pid, name: 'パーソナル Q2 2026', hue: 295, createdAt: Date.now() },
    },
    projectOrder: [pid],
    activeProjectId: pid,
    tasksByProject: {
      [pid]: [
        { id: 't1', title: '健康診断の予約', start: '2026-04-20', end: '2026-04-22', progress: 100, hours: 1, parent: null, deps: [], priority: 'med', milestone: false },
        { id: 't2', title: 'ジム入会・パーソナル予約', start: '2026-04-22', end: '2026-04-26', progress: 100, hours: 3, parent: null, deps: ['t1'], priority: 'med', milestone: false },
        { id: 't3', title: '運動習慣を週3回確立', start: '2026-04-26', end: '2026-05-24', progress: 60, hours: 24, parent: null, deps: ['t2'], priority: 'high', milestone: false },
        { id: 't4', title: '🏁 健康習慣の定着', start: '2026-05-24', end: '2026-05-24', progress: 0, hours: 0, parent: null, deps: ['t3'], priority: 'high', milestone: true },
      ],
    },
  };
})();

// Backward-compat: SAMPLE_TASKS still works for the design canvas
window.SAMPLE_TASKS = window.SAMPLE_PROJECTS.tasksByProject[window.SAMPLE_PROJECTS.activeProjectId];

// All tasks belong to the active project — group=undefined now (we no longer color by group).
// For legacy demos, fake a "group" so old views don't break.
window.SAMPLE_TASKS = window.SAMPLE_TASKS.map(t => ({ ...t, group: 'default' }));
window.GROUPS = { default: { name: '一般', en: 'General', hue: 295 } };

// ─── ID gen ─────────────────────────────────────────────────────
window.genId = function (prefix = 't') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
};

// ─── Date utilities — now project-aware (computed from tasks) ──
window.dateUtilsFor = function (tasks) {
  // dynamic project bounds based on tasks; fallback if empty
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let start, end;
  if (tasks.length === 0) {
    start = new Date(today); start.setDate(start.getDate() - 7);
    end = new Date(today); end.setDate(end.getDate() + 60);
  } else {
    let minS = Infinity, maxE = -Infinity;
    tasks.forEach(t => {
      const s = new Date(t.start).getTime();
      const e = new Date(t.end).getTime();
      if (s < minS) minS = s;
      if (e > maxE) maxE = e;
    });
    start = new Date(minS);
    end = new Date(maxE);
    // pad
    start.setDate(start.getDate() - 3);
    end.setDate(end.getDate() + 7);
  }
  const DAY = 86400000;
  const totalDays = Math.max(14, Math.round((end - start) / DAY));

  function dayOffset(dateStr) { return Math.round((new Date(dateStr) - start) / DAY); }
  function duration(s, e) { return Math.max(1, Math.round((new Date(e) - new Date(s)) / DAY)); }
  function fmt(d) { const dt = typeof d === 'string' ? new Date(d) : d; return `${dt.getMonth() + 1}/${dt.getDate()}`; }
  function fmtFull(d) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  function todayOffset() { return Math.round((today - start) / DAY); }
  function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return fmtFull(d); }

  return { PROJECT_START: start, PROJECT_END: end, DAY, totalDays, TODAY: today,
           dayOffset, duration, fmt, fmtFull, todayOffset, addDays };
};

// Static fallback for legacy components that read window.dateUtils directly
window.dateUtils = window.dateUtilsFor(window.SAMPLE_TASKS);

window.computeStats = function (tasks) {
  const non_ms = tasks.filter(t => !t.milestone);
  const total = non_ms.length;
  if (total === 0) {
    return { total: 0, done: 0, inProgress: 0, notStarted: 0, avgProgress: 0, totalHours: 0, doneHours: 0 };
  }
  const done = non_ms.filter(t => t.progress === 100).length;
  const inProgress = non_ms.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStarted = non_ms.filter(t => t.progress === 0).length;
  const avgProgress = Math.round(non_ms.reduce((s, t) => s + t.progress, 0) / total);
  const totalHours = non_ms.reduce((s, t) => s + t.hours, 0);
  const doneHours = non_ms.reduce((s, t) => s + t.hours * (t.progress / 100), 0);
  return { total, done, inProgress, notStarted, avgProgress, totalHours, doneHours: Math.round(doneHours) };
};

// ─── State migration / validation ───────────────────────────────
window.normalizeState = function (raw) {
  if (!raw || typeof raw !== 'object') return window.makeInitialState();
  if (!raw.projects || !raw.projectOrder || !raw.activeProjectId || !raw.tasksByProject) {
    return window.makeInitialState();
  }
  // ensure activeProjectId exists
  if (!raw.projects[raw.activeProjectId]) {
    raw.activeProjectId = raw.projectOrder[0] || Object.keys(raw.projects)[0];
  }
  // ensure each project has tasks array
  Object.keys(raw.projects).forEach(pid => {
    if (!raw.tasksByProject[pid]) raw.tasksByProject[pid] = [];
  });
  return raw;
};
