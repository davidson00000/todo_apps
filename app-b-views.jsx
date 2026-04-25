// app-b-views.jsx — 案B "Aurora": List + Dashboard + Gantt + Network
const { B_TOKENS: BT, IconB: BIcon, ProgressRingB: BRing } = window;

// ─── Card ─────────────────────────────────────────────────────
function CardB({ children, span = 1, padding = 20, style }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: BT.panel,
      borderRadius: 14,
      padding,
      boxShadow: '0 1px 2px rgba(40,30,55,0.04), 0 1px 0 rgba(40,30,55,0.02)',
      border: `1px solid ${BT.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── List View (B) — card list with friendlier rhythm ──────────
function ListViewB({ tasks, density }) {
  const [filter, setFilter] = React.useState('all');
  const padY = density === 'compact' ? 10 : density === 'comfy' ? 18 : 14;
  const fs = density === 'compact' ? 12.5 : density === 'comfy' ? 14 : 13.5;

  const groupOrder = ['side', 'health', 'home'];
  const filtered = filter === 'all' ? tasks
    : filter === 'active' ? tasks.filter(t => t.progress > 0 && t.progress < 100)
    : filter === 'todo' ? tasks.filter(t => t.progress === 0 && !t.milestone)
    : filter === 'done' ? tasks.filter(t => t.progress === 100)
    : tasks;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 60px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'all', label: 'すべて', count: tasks.length },
          { id: 'active', label: '進行中', count: tasks.filter(t => t.progress > 0 && t.progress < 100).length },
          { id: 'todo', label: '未着手', count: tasks.filter(t => t.progress === 0 && !t.milestone).length },
          { id: 'done', label: '完了', count: tasks.filter(t => t.progress === 100).length },
        ].map(f => (
          <div key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'default',
            background: filter === f.id ? BT.accentSoft : 'transparent',
            color: filter === f.id ? BT.accentDeep : BT.textMuted,
            border: `1px solid ${filter === f.id ? 'oklch(0.85 0.06 295)' : BT.border}`,
            fontWeight: filter === f.id ? 600 : 500,
          }}>
            {f.label}<span style={{ marginLeft: 6, opacity: 0.6, fontFamily: BT.mono }}>{f.count}</span>
          </div>
        ))}
      </div>

      {groupOrder.map(gKey => {
        const gTasks = filtered.filter(t => t.group === gKey && !t.parent);
        if (gTasks.length === 0) return null;
        const g = window.GROUPS[gKey];
        return (
          <div key={gKey} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3,
                background: `linear-gradient(135deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.16 ${g.hue}))` }} />
              <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: BT.text }}>{g.name}</h3>
              <span style={{ fontSize: 11, color: BT.textFaint, fontFamily: BT.mono }}>{g.en}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: BT.textFaint, fontFamily: BT.mono }}>
                {gTasks.length} tasks
              </span>
            </div>
            <CardB padding={0}>
              {gTasks.map((t, i) => {
                const subs = filtered.filter(s => s.parent === t.id);
                return (
                  <React.Fragment key={t.id}>
                    <TaskRowB t={t} g={g} padY={padY} fs={fs}
                      isLast={i === gTasks.length - 1 && subs.length === 0} />
                    {subs.map((s, j) => (
                      <TaskRowB key={s.id} t={s} g={g} padY={padY} fs={fs}
                        isSub isLast={j === subs.length - 1 && i === gTasks.length - 1} />
                    ))}
                  </React.Fragment>
                );
              })}
            </CardB>
          </div>
        );
      })}
    </div>
  );
}

function TaskRowB({ t, g, padY, fs, isSub, isLast }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '24px minmax(220px, 1fr) 110px 96px 60px 130px 60px',
      alignItems: 'center', gap: 12,
      padding: `${padY}px ${isSub ? 36 : 18}px`,
      borderBottom: isLast ? 'none' : `1px solid ${BT.border}`,
      fontSize: fs, color: BT.text,
      background: t.milestone ? `linear-gradient(90deg, ${BT.accentSoft}, transparent)` : 'transparent',
    }}>
      {/* checkbox / diamond */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {t.milestone ? (
          <BIcon name="diamond" size={12} color={`oklch(0.55 0.18 ${g.hue})`} />
        ) : (
          <div style={{
            width: 18, height: 18, borderRadius: 6,
            border: `1.5px solid ${t.progress === 100 ? BT.ok : BT.borderStrong}`,
            background: t.progress === 100 ? BT.ok : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {t.progress === 100 && <BIcon name="check" size={11} color="#fff" />}
          </div>
        )}
      </div>
      {/* title */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontWeight: !isSub && !t.milestone ? 500 : 400,
          color: t.progress === 100 ? BT.textMuted : BT.text,
          textDecoration: t.progress === 100 ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{t.title}</div>
        <div style={{ fontSize: fs - 2, color: BT.textFaint, fontFamily: BT.mono, marginTop: 2 }}>
          {t.en}
        </div>
      </div>
      {/* group */}
      <div>
        <span style={{
          padding: '3px 9px', borderRadius: 12, fontSize: fs - 2, fontWeight: 500,
          background: `oklch(0.96 0.03 ${g.hue})`, color: `oklch(0.40 0.14 ${g.hue})`,
        }}>{g.name}</span>
      </div>
      {/* date */}
      <div style={{ fontSize: fs - 1.5, color: BT.textMuted, fontFamily: BT.mono }}>
        {window.dateUtils.fmt(t.start)} — {window.dateUtils.fmt(t.end)}
      </div>
      {/* hours */}
      <div style={{ fontSize: fs - 1.5, color: BT.textMuted, fontFamily: BT.mono, textAlign: 'right' }}>
        {t.hours > 0 ? `${t.hours}h` : '—'}
      </div>
      {/* progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!t.milestone && (
          <>
            <div style={{ flex: 1, height: 5, background: 'rgba(40,30,55,0.06)', borderRadius: 3 }}>
              <div style={{
                width: `${t.progress}%`, height: '100%', borderRadius: 3,
                background: t.progress === 100 ? BT.ok :
                  `linear-gradient(90deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.18 ${g.hue}))`,
              }} />
            </div>
            <span style={{ fontFamily: BT.mono, fontSize: fs - 2.5, color: BT.textMuted, width: 28, textAlign: 'right' }}>
              {t.progress}%
            </span>
          </>
        )}
        {t.milestone && (
          <span style={{ fontSize: fs - 2, color: BT.accentDeep, fontWeight: 500 }}>
            マイルストーン
          </span>
        )}
      </div>
      {/* priority */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {t.priority === 'high' && <span style={{ fontSize: fs - 2, color: BT.danger, fontWeight: 600 }}>● 高</span>}
        {t.priority === 'med' && <span style={{ fontSize: fs - 2, color: BT.warn, fontWeight: 500 }}>● 中</span>}
        {t.priority === 'low' && <span style={{ fontSize: fs - 2, color: BT.textFaint }}>● 低</span>}
      </div>
    </div>
  );
}

// ─── Dashboard (B) — feature-card layout with rings ───────────
function DashViewB({ tasks }) {
  const stats = window.computeStats(tasks);
  const today = new Date('2026-04-25');
  const weekEnd = new Date('2026-05-02');
  const thisWeek = tasks.filter(t => {
    if (t.milestone) return false;
    const s = new Date(t.start), e = new Date(t.end);
    return s <= weekEnd && e >= today;
  });
  const milestones = tasks.filter(t => t.milestone).sort((a, b) => new Date(a.start) - new Date(b.start));

  const groupStats = Object.entries(window.GROUPS).map(([k, g]) => {
    const ts = tasks.filter(t => t.group === k && !t.milestone);
    const avg = Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length);
    return { ...g, key: k, count: ts.length, avg, doneN: ts.filter(t => t.progress === 100).length };
  });

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        {/* Hero progress card */}
        <CardB span={3} padding={24} style={{
          background: `linear-gradient(135deg, oklch(0.97 0.02 295), ${BT.panel})`,
          border: '1px solid oklch(0.90 0.04 295)',
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <BRing value={stats.avgProgress} size={108} stroke={9} hue={295} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em',
                color: BT.textFaint, textTransform: 'uppercase', fontFamily: BT.mono }}>
                Overall Progress
              </div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 600, color: BT.text,
                letterSpacing: '-0.01em' }}>
                プロジェクト全体の進捗
              </div>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { v: stats.done, l: '完了', c: BT.ok },
                  { v: stats.inProgress, l: '進行中', c: BT.accent },
                  { v: stats.notStarted, l: '未着手', c: BT.textFaint },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: s.c, fontFamily: BT.mono }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: BT.textMuted }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardB>

        {/* Hours card */}
        <CardB span={3} padding={24}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em',
                color: BT.textFaint, textTransform: 'uppercase', fontFamily: BT.mono }}>
                Hours
              </div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 600, color: BT.text }}>
                工数の消化
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: BT.mono, fontSize: 28, fontWeight: 600, color: BT.text }}>
                  {stats.doneHours}
                </span>
                <span style={{ fontFamily: BT.mono, fontSize: 14, color: BT.textMuted }}>
                  / {stats.totalHours}h
                </span>
              </div>
              <div style={{ marginTop: 8, width: 240, height: 6, background: 'rgba(40,30,55,0.06)',
                borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${(stats.doneHours / stats.totalHours) * 100}%`, height: '100%',
                  background: `linear-gradient(90deg, oklch(0.72 0.12 295), oklch(0.50 0.20 295))`,
                  borderRadius: 3,
                }} />
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <BRing value={Math.round((stats.doneHours / stats.totalHours) * 100)}
              size={92} stroke={8} hue={250} />
          </div>
        </CardB>

        {/* Group progress cards */}
        {groupStats.map(g => (
          <CardB key={g.key} span={2} padding={20}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <BRing value={g.avg} size={64} stroke={6} hue={g.hue} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: BT.text }}>{g.name}</div>
                <div style={{ fontSize: 10.5, color: BT.textFaint, fontFamily: BT.mono, marginTop: 2 }}>
                  {g.en}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: BT.textMuted }}>
                  {g.doneN}/{g.count} タスク完了
                </div>
              </div>
            </div>
          </CardB>
        ))}

        {/* Burndown trend */}
        <CardB span={4} padding={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: BT.text }}>進捗トレンド</div>
              <div style={{ fontSize: 11, color: BT.textFaint, fontFamily: BT.mono }}>BURN-DOWN · weekly</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: BT.textMuted, fontFamily: BT.mono }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 2.5, borderRadius: 2, background: BT.accent }} /> 実績
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 1, borderRadius: 1, background: BT.textFaint, borderTop: `1px dashed ${BT.textFaint}` }} /> 計画
              </span>
            </div>
          </div>
          <BurndownB tasks={tasks} />
        </CardB>

        {/* Milestones rail */}
        <CardB span={2} padding={20}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: BT.text }}>マイルストーン</div>
            <div style={{ fontSize: 11, color: BT.textFaint, fontFamily: BT.mono }}>
              MILESTONES · {milestones.length}
            </div>
          </div>
          <div style={{ position: 'relative', paddingLeft: 18 }}>
            <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 1.5,
              background: `linear-gradient(to bottom, ${BT.accentMid}, ${BT.border})` }} />
            {milestones.map((m, i) => {
              const g = window.GROUPS[m.group];
              const days = Math.round((new Date(m.start) - new Date('2026-04-25')) / 86400000);
              const isPast = days < 0;
              return (
                <div key={m.id} style={{ position: 'relative', marginBottom: i === milestones.length - 1 ? 0 : 14 }}>
                  <div style={{
                    position: 'absolute', left: -19, top: 2, width: 11, height: 11,
                    background: isPast ? BT.ok : BT.panel,
                    border: `2px solid ${isPast ? BT.ok : `oklch(0.55 0.18 ${g.hue})`}`,
                    transform: 'rotate(45deg)',
                  }} />
                  <div style={{ fontSize: 12.5, color: BT.text, fontWeight: 500 }}>{m.title}</div>
                  <div style={{ fontSize: 10.5, color: BT.textMuted, fontFamily: BT.mono, marginTop: 2 }}>
                    {window.dateUtils.fmt(m.start)} · {isPast ? '完了' : `+${days}d`}
                  </div>
                </div>
              );
            })}
          </div>
        </CardB>

        {/* This week */}
        <CardB span={6} padding={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: BT.text }}>今週のタスク</div>
            <div style={{ fontSize: 11, color: BT.textFaint, fontFamily: BT.mono }}>
              THIS WEEK · {thisWeek.length}件
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {thisWeek.slice(0, 6).map(t => {
              const g = window.GROUPS[t.group];
              return (
                <div key={t.id} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: `oklch(0.98 0.012 ${g.hue})`,
                  border: `1px solid oklch(0.92 0.03 ${g.hue})`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em',
                      color: `oklch(0.40 0.14 ${g.hue})`, textTransform: 'uppercase',
                    }}>{g.en}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: BT.textFaint, fontFamily: BT.mono }}>
                      {t.hours}h
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: BT.text, lineHeight: 1.4 }}>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(40,30,55,0.06)', borderRadius: 2 }}>
                      <div style={{
                        width: `${t.progress}%`, height: '100%', borderRadius: 2,
                        background: `linear-gradient(90deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.18 ${g.hue}))`,
                      }} />
                    </div>
                    <span style={{ fontFamily: BT.mono, fontSize: 10, color: BT.textMuted }}>{t.progress}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: BT.textFaint, fontFamily: BT.mono }}>
                    {window.dateUtils.fmt(t.start)} → {window.dateUtils.fmt(t.end)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardB>
      </div>
    </div>
  );
}

function BurndownB({ tasks }) {
  const W = 720, H = 180, padL = 36, padB = 28, padT = 12, padR = 12;
  const days = window.dateUtils.totalDays;
  const totalH = tasks.filter(t => !t.milestone).reduce((s, t) => s + t.hours, 0);
  const todayD = window.dateUtils.todayOffset();
  const actualNow = tasks.filter(t => !t.milestone).reduce((s, t) => s + t.hours * (1 - t.progress / 100), 0);

  const xS = (d) => padL + (d / days) * (W - padL - padR);
  const yS = (h) => padT + (1 - h / totalH) * (H - padT - padB);

  const idealPath = `M ${xS(0)} ${yS(totalH)} L ${xS(days)} ${yS(0)}`;
  // soft curved actual through (0, total) → (today, actualNow) projected → (days, ?)
  const actualPath = `M ${xS(0)} ${yS(totalH)} Q ${xS(todayD * 0.6)} ${yS(totalH * 0.85)} ${xS(todayD)} ${yS(actualNow)}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="bnFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.20 295)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.55 0.20 295)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = padT + p * (H - padT - padB);
        return <line key={p} x1={padL} x2={W - padR} y1={y} y2={y} stroke={BT.border} />;
      })}
      {/* x labels weekly */}
      {Array.from({ length: 6 }, (_, i) => i * (days / 5)).map((d, i) => {
        const dt = new Date(window.dateUtils.PROJECT_START);
        dt.setDate(dt.getDate() + Math.round(d));
        return (
          <text key={i} x={xS(d)} y={H - 10} textAnchor="middle"
            fontSize="10" fill={BT.textFaint} fontFamily={BT.mono}>
            {window.dateUtils.fmt(dt)}
          </text>
        );
      })}
      {/* y labels */}
      {[totalH, totalH/2, 0].map((v, i) => (
        <text key={i} x={padL - 6} y={yS(v) + 3} textAnchor="end"
          fontSize="10" fill={BT.textFaint} fontFamily={BT.mono}>{Math.round(v)}h</text>
      ))}
      {/* actual fill */}
      <path d={`${actualPath} L ${xS(todayD)} ${H - padB} L ${xS(0)} ${H - padB} Z`} fill="url(#bnFill)" />
      {/* ideal */}
      <path d={idealPath} stroke={BT.textFaint} strokeWidth="1" strokeDasharray="4 4" fill="none" />
      {/* actual */}
      <path d={actualPath} stroke={BT.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx={xS(0)} cy={yS(totalH)} r="3" fill={BT.accent} />
      <circle cx={xS(todayD)} cy={yS(actualNow)} r="4" fill={BT.accent} stroke="#fff" strokeWidth="2" />
      {/* today vertical */}
      <line x1={xS(todayD)} x2={xS(todayD)} y1={padT} y2={H - padB}
        stroke={BT.accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <rect x={xS(todayD) - 22} y={padT} width={44} height={16} rx="3" fill={BT.accent} />
      <text x={xS(todayD)} y={padT + 11} textAnchor="middle" fontSize="9.5" fill="#fff" fontFamily={BT.mono} fontWeight="600">TODAY</text>
    </svg>
  );
}

window.ListViewB = ListViewB;
window.DashViewB = DashViewB;
