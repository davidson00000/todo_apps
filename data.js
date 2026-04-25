// data.js — Sample task data for personal life project
// Personal project: 健康習慣＆副業ローンチ（April–June 2026）

window.SAMPLE_TASKS = [
  // 健康習慣
  { id: 't1', title: '健康診断の予約', en: 'Book annual checkup', start: '2026-04-20', end: '2026-04-22', progress: 100, hours: 1, parent: null, deps: [], priority: 'med', milestone: false, group: 'health' },
  { id: 't2', title: 'ジム入会・パーソナル予約', en: 'Gym signup + PT', start: '2026-04-22', end: '2026-04-26', progress: 100, hours: 3, parent: null, deps: ['t1'], priority: 'med', milestone: false, group: 'health' },
  { id: 't3', title: '運動習慣を週3回確立', en: 'Establish 3x/week routine', start: '2026-04-26', end: '2026-05-24', progress: 60, hours: 24, parent: null, deps: ['t2'], priority: 'high', milestone: false, group: 'health' },
  { id: 't3a', title: '朝のストレッチルーティン', en: 'Morning stretch', start: '2026-04-26', end: '2026-05-10', progress: 80, hours: 7, parent: 't3', deps: [], priority: 'low', milestone: false, group: 'health' },
  { id: 't3b', title: '週末のロングラン', en: 'Weekend long run', start: '2026-05-03', end: '2026-05-24', progress: 40, hours: 12, parent: 't3', deps: [], priority: 'med', milestone: false, group: 'health' },
  { id: 't4', title: '🏁 健康習慣の定着', en: 'Health habit established', start: '2026-05-24', end: '2026-05-24', progress: 0, hours: 0, parent: null, deps: ['t3'], priority: 'high', milestone: true, group: 'health' },

  // 副業ローンチ
  { id: 't5', title: 'プロジェクト構想を整理', en: 'Define project scope', start: '2026-04-20', end: '2026-04-28', progress: 100, hours: 8, parent: null, deps: [], priority: 'high', milestone: false, group: 'side' },
  { id: 't6', title: 'ロゴ・ブランド設計', en: 'Logo & brand design', start: '2026-04-28', end: '2026-05-08', progress: 70, hours: 14, parent: null, deps: ['t5'], priority: 'med', milestone: false, group: 'side' },
  { id: 't7', title: 'ランディングページ制作', en: 'Build landing page', start: '2026-05-04', end: '2026-05-20', progress: 30, hours: 28, parent: null, deps: ['t5'], priority: 'high', milestone: false, group: 'side' },
  { id: 't7a', title: 'コピーライティング', en: 'Copywriting', start: '2026-05-04', end: '2026-05-10', progress: 50, hours: 8, parent: 't7', deps: [], priority: 'med', milestone: false, group: 'side' },
  { id: 't7b', title: 'デザインモック', en: 'Design mockup', start: '2026-05-08', end: '2026-05-15', progress: 20, hours: 12, parent: 't7', deps: ['t6'], priority: 'high', milestone: false, group: 'side' },
  { id: 't7c', title: '実装＆デプロイ', en: 'Implement & deploy', start: '2026-05-13', end: '2026-05-20', progress: 0, hours: 8, parent: 't7', deps: ['t7b'], priority: 'high', milestone: false, group: 'side' },
  { id: 't8', title: 'SNSアカウント開設＆発信', en: 'Social presence', start: '2026-05-15', end: '2026-06-05', progress: 0, hours: 16, parent: null, deps: ['t6'], priority: 'med', milestone: false, group: 'side' },
  { id: 't9', title: '🚀 ベータ公開', en: 'Beta launch', start: '2026-05-20', end: '2026-05-20', progress: 0, hours: 0, parent: null, deps: ['t7'], priority: 'high', milestone: true, group: 'side' },
  { id: 't10', title: 'ユーザーインタビュー（5名）', en: 'User interviews (n=5)', start: '2026-05-21', end: '2026-06-08', progress: 0, hours: 12, parent: null, deps: ['t9'], priority: 'med', milestone: false, group: 'side' },
  { id: 't11', title: '正式ローンチ準備', en: 'Public launch prep', start: '2026-06-08', end: '2026-06-22', progress: 0, hours: 20, parent: null, deps: ['t10', 't8'], priority: 'high', milestone: false, group: 'side' },
  { id: 't12', title: '🎯 正式ローンチ', en: 'Public launch', start: '2026-06-22', end: '2026-06-22', progress: 0, hours: 0, parent: null, deps: ['t11'], priority: 'high', milestone: true, group: 'side' },

  // 暮らし
  { id: 't13', title: 'リビングの片付け', en: 'Declutter living room', start: '2026-04-25', end: '2026-04-27', progress: 100, hours: 4, parent: null, deps: [], priority: 'low', milestone: false, group: 'home' },
  { id: 't14', title: 'ふるさと納税の選定', en: 'Furusato tax planning', start: '2026-05-01', end: '2026-05-10', progress: 0, hours: 3, parent: null, deps: [], priority: 'low', milestone: false, group: 'home' },
  { id: 't15', title: '夏の旅行を計画', en: 'Plan summer trip', start: '2026-05-15', end: '2026-06-01', progress: 10, hours: 6, parent: null, deps: [], priority: 'med', milestone: false, group: 'home' },
];

window.GROUPS = {
  health: { name: '健康習慣', en: 'Health', hue: 165 },
  side:   { name: '副業ローンチ', en: 'Side Project', hue: 295 },
  home:   { name: '暮らし', en: 'Home Life', hue: 35 },
};

// Helpers
window.dateUtils = (() => {
  const PROJECT_START = new Date('2026-04-20');
  const PROJECT_END = new Date('2026-06-28');
  const DAY = 86400000;
  const totalDays = Math.round((PROJECT_END - PROJECT_START) / DAY);
  const TODAY = new Date('2026-04-25');

  function dayOffset(dateStr) {
    return Math.round((new Date(dateStr) - PROJECT_START) / DAY);
  }
  function duration(startStr, endStr) {
    return Math.max(1, Math.round((new Date(endStr) - new Date(startStr)) / DAY));
  }
  function fmt(d) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  }
  function fmtFull(d) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  function todayOffset() {
    return Math.round((TODAY - PROJECT_START) / DAY);
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return fmtFull(d);
  }
  return { PROJECT_START, PROJECT_END, DAY, totalDays, TODAY, dayOffset, duration, fmt, fmtFull, todayOffset, addDays };
})();

// Aggregate stats
window.computeStats = function(tasks) {
  const non_ms = tasks.filter(t => !t.milestone);
  const total = non_ms.length;
  const done = non_ms.filter(t => t.progress === 100).length;
  const inProgress = non_ms.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStarted = non_ms.filter(t => t.progress === 0).length;
  const avgProgress = Math.round(non_ms.reduce((s, t) => s + t.progress, 0) / total);
  const totalHours = non_ms.reduce((s, t) => s + t.hours, 0);
  const doneHours = non_ms.reduce((s, t) => s + t.hours * (t.progress / 100), 0);
  return { total, done, inProgress, notStarted, avgProgress, totalHours, doneHours: Math.round(doneHours) };
};
