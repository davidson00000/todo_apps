// app-a-views.jsx — 案A の3+1ビュー
// (window.A_TOKENS, window.IconA, window.ChipA, window.ProgressBarA に依存)

const { A_TOKENS: AT, IconA: AIcon, ChipA: AChip, ProgressBarA: APBar } = window;

// ─── Toolbar 共通 ─────────────────────────────────────────────
function ToolbarA({ title, sub, density, setDensity, view, dragHint, designVariant, setDesignVariant }) {
  return (
    <div style={{
      height: 44, padding: '0 16px 0 12px',
      borderBottom: `1px solid ${AT.border}`,
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      background: AT.panel,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: AT.text }}>{title}</span>
        <span style={{ fontSize: 11, color: AT.textFaint, fontFamily: AT.mono }}>{sub}</span>
      </div>
      {dragHint && (
        <div style={{ fontSize: 10.5, color: AT.textFaint, fontFamily: AT.mono,
          padding: '3px 8px', borderRadius: 4, background: AT.accentSoft }}>
          ⤡ ドラッグで日程変更
        </div>
      )}
      {setDesignVariant && (
        <div style={{
          display: 'flex', height: 24, borderRadius: 5,
          background: 'rgba(20,15,30,0.05)', padding: 2,
        }}>
          <div onClick={() => setDesignVariant('a')} style={{
            padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10.5, borderRadius: 4, cursor: 'default',
            background: designVariant === 'a' ? AT.panel : 'transparent',
            color: designVariant === 'a' ? AT.text : AT.textMuted,
            fontWeight: designVariant === 'a' ? 600 : 500,
            boxShadow: designVariant === 'a' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: designVariant === 'a' ? AT.accent : AT.textFaint }} />
            A · Studio
          </div>
          <div onClick={() => setDesignVariant('b')} style={{
            padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10.5, borderRadius: 4, cursor: 'default',
            background: designVariant === 'b' ? AT.panel : 'transparent',
            color: designVariant === 'b' ? AT.text : AT.textMuted,
            fontWeight: designVariant === 'b' ? 600 : 500,
            boxShadow: designVariant === 'b' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: designVariant === 'b' ? AT.accent : AT.textFaint }} />
            B · Aurora
          </div>
        </div>
      )}
      <div style={{
        display: 'flex', height: 24, borderRadius: 5,
        background: 'rgba(20,15,30,0.05)', padding: 2,
      }}>
        {['compact', 'regular', 'comfy'].map(d => (
          <div key={d} onClick={() => setDensity(d)} style={{
            padding: '0 8px', display: 'flex', alignItems: 'center',
            fontSize: 10.5, borderRadius: 4, cursor: 'default',
            background: density === d ? AT.panel : 'transparent',
            color: density === d ? AT.text : AT.textMuted,
            boxShadow: density === d ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
          }}>{d}</div>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 8px', height: 24, borderRadius: 5,
        background: AT.accent, color: '#fff',
        fontSize: 11, fontWeight: 500, cursor: 'default',
      }}>
        <AIcon name="plus" size={11} color="#fff" />
        <span>新規タスク</span>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────
function ListViewA({ tasks, density }) {
  const rowH = density === 'compact' ? 28 : density === 'comfy' ? 40 : 32;
  const fs = density === 'compact' ? 11.5 : density === 'comfy' ? 13 : 12;
  const [expanded, setExpanded] = React.useState({ t3: true, t7: true });

  // build hierarchy
  const roots = tasks.filter(t => !t.parent);
  const children = (id) => tasks.filter(t => t.parent === id);

  const cols = [
    { key: 'name', label: 'タスク名', w: 'minmax(280px, 1fr)' },
    { key: 'group', label: 'グループ', w: '110px' },
    { key: 'start', label: '開始', w: '78px' },
    { key: 'end', label: '期限', w: '78px' },
    { key: 'hours', label: '工数', w: '52px' },
    { key: 'progress', label: '進捗', w: '120px' },
    { key: 'priority', label: '優先', w: '60px' },
    { key: 'deps', label: '依存', w: '80px' },
  ];
  const gridCols = cols.map(c => c.w).join(' ');

  const renderRow = (t, depth = 0) => {
    const g = window.GROUPS[t.group];
    const kids = children(t.id);
    const hasKids = kids.length > 0;
    const exp = expanded[t.id];
    return (
      <React.Fragment key={t.id}>
        <div style={{
          display: 'grid', gridTemplateColumns: gridCols,
          height: rowH, alignItems: 'center', padding: '0 14px',
          borderBottom: `1px solid ${AT.border}`,
          fontSize: fs, color: AT.text,
          background: t.milestone ? 'oklch(0.97 0.02 295)' : 'transparent',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = t.milestone ? 'oklch(0.95 0.03 295)' : 'rgba(20,15,30,0.025)'}
          onMouseLeave={(e) => e.currentTarget.style.background = t.milestone ? 'oklch(0.97 0.02 295)' : 'transparent'}
        >
          {/* name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: depth * 18, minWidth: 0 }}>
            {hasKids ? (
              <div onClick={() => setExpanded(s => ({ ...s, [t.id]: !exp }))}
                style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                <AIcon name={exp ? 'chevD' : 'chev'} size={10} color={AT.textMuted} />
              </div>
            ) : <div style={{ width: 14 }} />}
            {t.milestone ? (
              <AIcon name="diamond" size={9} color={AT.accent} />
            ) : (
              <div style={{ width: 12, height: 12, borderRadius: 3,
                border: `1.2px solid ${t.progress === 100 ? AT.ok : AT.borderStrong}`,
                background: t.progress === 100 ? AT.ok : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.progress === 100 && <AIcon name="check" size={8} color="#fff" />}
              </div>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontWeight: depth === 0 && hasKids ? 500 : 400,
              textDecoration: t.progress === 100 ? 'line-through' : 'none',
              color: t.progress === 100 ? AT.textMuted : AT.text }}>{t.title}</span>
            {depth === 0 && (
              <span style={{ fontSize: fs - 1.5, color: AT.textFaint, fontFamily: AT.mono, marginLeft: 4 }}>
                {t.en}
              </span>
            )}
          </div>
          {/* group */}
          <div>
            <AChip hue={g.hue} filled>{g.name}</AChip>
          </div>
          {/* start / end */}
          <div style={{ fontFamily: AT.mono, fontSize: fs - 1, color: AT.textMuted }}>{window.dateUtils.fmt(t.start)}</div>
          <div style={{ fontFamily: AT.mono, fontSize: fs - 1, color: AT.textMuted }}>{window.dateUtils.fmt(t.end)}</div>
          {/* hours */}
          <div style={{ fontFamily: AT.mono, fontSize: fs - 1, color: AT.textMuted, textAlign: 'right', paddingRight: 8 }}>
            {t.hours > 0 ? `${t.hours}h` : '—'}
          </div>
          {/* progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!t.milestone && (
              <>
                <APBar value={t.progress} w={70} />
                <span style={{ fontFamily: AT.mono, fontSize: fs - 1.5, color: AT.textMuted, minWidth: 28 }}>{t.progress}%</span>
              </>
            )}
            {t.milestone && <AChip hue={295} filled>マイルストーン</AChip>}
          </div>
          {/* priority */}
          <div>
            {t.priority === 'high' && <AChip hue={25} filled>高</AChip>}
            {t.priority === 'med'  && <AChip hue={65} filled>中</AChip>}
            {t.priority === 'low'  && <AChip hue={200}>低</AChip>}
          </div>
          {/* deps */}
          <div style={{ fontFamily: AT.mono, fontSize: fs - 1.5, color: AT.textFaint }}>
            {t.deps.length ? t.deps.join(', ') : '—'}
          </div>
        </div>
        {hasKids && exp && kids.map(k => renderRow(k, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: AT.panel }}>
      {/* col header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1,
        display: 'grid', gridTemplateColumns: gridCols,
        height: 30, alignItems: 'center', padding: '0 14px',
        borderBottom: `1px solid ${AT.borderStrong}`, background: AT.panel,
        fontSize: 10.5, fontWeight: 600, color: AT.textMuted,
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {cols.map(c => <div key={c.key}>{c.label}</div>)}
      </div>
      {roots.map(t => renderRow(t))}
      <div style={{ height: 100 }} />
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────
function DashViewA({ tasks }) {
  const stats = window.computeStats(tasks);
  const today = new Date('2026-04-25');
  const weekEnd = new Date('2026-05-02');
  const thisWeek = tasks.filter(t => {
    if (t.milestone) return false;
    const s = new Date(t.start), e = new Date(t.end);
    return s <= weekEnd && e >= today;
  });
  const milestones = tasks.filter(t => t.milestone).sort((a, b) => new Date(a.start) - new Date(b.start));

  // group progress
  const groupStats = Object.entries(window.GROUPS).map(([k, g]) => {
    const ts = tasks.filter(t => t.group === k && !t.milestone);
    const avg = Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length);
    return { ...g, key: k, count: ts.length, avg };
  });

  const Card = ({ title, sub, span = 1, children, padding = 16 }) => (
    <div style={{
      gridColumn: `span ${span}`,
      background: AT.panel, border: `1px solid ${AT.border}`,
      borderRadius: 8, padding,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: AT.text, letterSpacing: '0.01em' }}>{title}</span>
        {sub && <span style={{ fontSize: 10, color: AT.textFaint, fontFamily: AT.mono }}>{sub}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto', background: AT.panel2, padding: 16 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
      }}>
        {/* KPI row */}
        <Card title="プロジェクト進捗" sub="OVERALL">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontFamily: AT.mono, fontSize: 32, fontWeight: 600, color: AT.text, lineHeight: 1 }}>
              {stats.avgProgress}<span style={{ fontSize: 16, color: AT.textMuted }}>%</span>
            </div>
            <div style={{ fontSize: 10.5, color: AT.textMuted, marginBottom: 4 }}>
              {stats.done}/{stats.total} 完了
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <APBar value={stats.avgProgress} w={'100%'} h={6} />
          </div>
        </Card>
        <Card title="完了タスク" sub="DONE">
          <div style={{ fontFamily: AT.mono, fontSize: 32, fontWeight: 600, color: AT.ok, lineHeight: 1 }}>{stats.done}</div>
          <div style={{ marginTop: 10, fontSize: 10.5, color: AT.textMuted }}>
            進行中 {stats.inProgress} · 未着手 {stats.notStarted}
          </div>
        </Card>
        <Card title="工数（実 / 計）" sub="HOURS">
          <div style={{ fontFamily: AT.mono, fontSize: 32, fontWeight: 600, color: AT.text, lineHeight: 1 }}>
            {stats.doneHours}<span style={{ fontSize: 16, color: AT.textMuted }}>/{stats.totalHours}h</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <APBar value={(stats.doneHours / stats.totalHours) * 100} w={'100%'} h={6} />
          </div>
        </Card>
        <Card title="残日数" sub="DAYS LEFT">
          <div style={{ fontFamily: AT.mono, fontSize: 32, fontWeight: 600, color: AT.accent, lineHeight: 1 }}>
            {Math.round((window.dateUtils.PROJECT_END - new Date('2026-04-25')) / 86400000)}
            <span style={{ fontSize: 16, color: AT.textMuted, marginLeft: 4 }}>日</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 10.5, color: AT.textMuted, fontFamily: AT.mono }}>
            until 2026-06-28
          </div>
        </Card>

        {/* Progress chart — group breakdown */}
        <Card title="グループ別進捗" sub="BY GROUP" span={2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groupStats.map(g => (
              <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 88, fontSize: 11.5, color: AT.text }}>
                  {g.name}
                </div>
                <div style={{ flex: 1, height: 18, background: 'rgba(20,15,30,0.04)',
                  borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${g.avg}%`,
                    background: `linear-gradient(90deg, oklch(0.78 0.10 ${g.hue}), oklch(0.62 0.16 ${g.hue}))`,
                    borderRadius: 3,
                  }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontFamily: AT.mono, fontSize: 11, color: AT.textMuted }}>
                  {g.avg}% · {g.count}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Burn-down chart */}
        <Card title="バーンダウン" sub="BURN-DOWN" span={2}>
          <BurndownChart tasks={tasks} />
        </Card>

        {/* This week */}
        <Card title="今週のタスク" sub={`THIS WEEK · ${thisWeek.length}件`} span={2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {thisWeek.slice(0, 6).map(t => {
              const g = window.GROUPS[t.group];
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 8px', borderRadius: 5,
                  background: 'rgba(20,15,30,0.025)',
                }}>
                  <div style={{ width: 4, height: 22, borderRadius: 2,
                    background: `oklch(0.65 0.14 ${g.hue})` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: AT.text, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: AT.textFaint, fontFamily: AT.mono }}>
                      {window.dateUtils.fmt(t.start)} – {window.dateUtils.fmt(t.end)} · {t.hours}h
                    </div>
                  </div>
                  <APBar value={t.progress} w={50} />
                  <span style={{ fontFamily: AT.mono, fontSize: 10.5, color: AT.textMuted, width: 28, textAlign: 'right' }}>
                    {t.progress}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Milestones */}
        <Card title="マイルストーン" sub={`MILESTONES · ${milestones.length}`} span={2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map(m => {
              const g = window.GROUPS[m.group];
              const dt = new Date(m.start);
              const days = Math.round((dt - new Date('2026-04-25')) / 86400000);
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AIcon name="diamond" size={11} color={`oklch(0.55 0.18 ${g.hue})`} />
                  <div style={{ flex: 1, fontSize: 11.5, color: AT.text }}>{m.title}</div>
                  <div style={{ fontFamily: AT.mono, fontSize: 10.5, color: AT.textMuted }}>
                    {window.dateUtils.fmt(m.start)}
                  </div>
                  <div style={{ fontFamily: AT.mono, fontSize: 10, color: days < 0 ? AT.ok : AT.textFaint, width: 50, textAlign: 'right' }}>
                    {days < 0 ? '完了' : `+${days}d`}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BurndownChart({ tasks }) {
  // Idealized burn-down vs actual
  const W = 420, H = 140, padL = 28, padB = 22, padT = 8, padR = 8;
  const days = 70; // project days
  const totalH = tasks.filter(t => !t.milestone).reduce((s, t) => s + t.hours, 0);
  // ideal line: totalH at day0 → 0 at day70
  const ideal = (d) => totalH - (totalH * d / days);
  // actual: assume linear consumption per task progress
  const todayD = window.dateUtils.todayOffset();
  const actualNow = tasks.filter(t => !t.milestone).reduce((s, t) => s + t.hours * (1 - t.progress / 100), 0);

  const xScale = (d) => padL + (d / days) * (W - padL - padR);
  const yScale = (h) => padT + (1 - h / totalH) * (H - padT - padB);

  // ideal points
  const idealPath = `M ${xScale(0)} ${yScale(totalH)} L ${xScale(days)} ${yScale(0)}`;
  // actual points (snapshot pretend a curve)
  const actualPts = [
    [0, totalH], [todayD, actualNow],
  ];
  const actualPath = `M ${xScale(actualPts[0][0])} ${yScale(actualPts[0][1])} L ${xScale(actualPts[1][0])} ${yScale(actualPts[1][1])}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = padT + p * (H - padT - padB);
        return <line key={p} x1={padL} x2={W - padR} y1={y} y2={y} stroke={AT.border} strokeWidth="1" />;
      })}
      {/* x ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const d = Math.round(p * days);
        const x = xScale(d);
        const dt = new Date(window.dateUtils.PROJECT_START);
        dt.setDate(dt.getDate() + d);
        return (
          <g key={p}>
            <line x1={x} x2={x} y1={H - padB} y2={H - padB + 3} stroke={AT.border} />
            <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill={AT.textFaint} fontFamily={AT.mono}>
              {window.dateUtils.fmt(dt)}
            </text>
          </g>
        );
      })}
      {/* y labels */}
      {[0, totalH / 2, totalH].map((v, i) => (
        <text key={i} x={padL - 4} y={yScale(v) + 3} textAnchor="end" fontSize="9" fill={AT.textFaint} fontFamily={AT.mono}>
          {Math.round(v)}h
        </text>
      ))}
      {/* ideal */}
      <path d={idealPath} stroke={AT.textFaint} strokeWidth="1" strokeDasharray="3 3" fill="none" />
      {/* actual */}
      <path d={actualPath} stroke={AT.accent} strokeWidth="1.8" fill="none" />
      <circle cx={xScale(0)} cy={yScale(totalH)} r="2.5" fill={AT.accent} />
      <circle cx={xScale(todayD)} cy={yScale(actualNow)} r="3" fill={AT.accent} />
      {/* today vertical */}
      <line x1={xScale(todayD)} x2={xScale(todayD)} y1={padT} y2={H - padB}
        stroke={AT.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      <text x={xScale(todayD) + 4} y={padT + 10} fontSize="9" fill={AT.accent} fontFamily={AT.mono}>
        today
      </text>
      {/* legend */}
      <g transform={`translate(${W - 130}, ${padT + 4})`}>
        <line x1="0" x2="14" y1="4" y2="4" stroke={AT.accent} strokeWidth="1.8" />
        <text x="18" y="7" fontSize="9" fill={AT.textMuted} fontFamily={AT.mono}>actual</text>
        <line x1="62" x2="76" y1="4" y2="4" stroke={AT.textFaint} strokeWidth="1" strokeDasharray="3 3" />
        <text x="80" y="7" fontSize="9" fill={AT.textMuted} fontFamily={AT.mono}>ideal</text>
      </g>
    </svg>
  );
}

window.ToolbarA = ToolbarA;
window.ListViewA = ListViewA;
window.DashViewA = DashViewA;
