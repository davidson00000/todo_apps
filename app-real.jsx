// app-real.jsx — Real working app (Mac/desktop layout).
// Replaces the mockup with: project switcher, full task list with CRUD,
// dashboard, gantt with edit, simple PERT.

const RA_ACCENT = 'oklch(0.55 0.18 295)';
const RA_TEXT = '#1a1820';
const RA_TEXT_MUTED = '#6b6478';
const RA_TEXT_FAINT = '#9b94a8';
const RA_BG = '#fafaf7';
const RA_BG_ALT = '#f5f3ee';
const RA_BORDER = 'rgba(20,15,30,0.10)';
const RA_BORDER_STRONG = 'rgba(20,15,30,0.18)';
const RA_OK = 'oklch(0.65 0.16 165)';
const RA_DANGER = 'oklch(0.55 0.20 25)';
const RA_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';
const RA_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// ─── Sidebar ───────────────────────────────────────────────────
function RealSidebar({ activeView, setView, taskCount, milestoneCount }) {
  const items = [
    { id: 'list', label: 'リスト', en: 'LIST', icon: 'list', count: taskCount },
    { id: 'dash', label: 'ダッシュボード', en: 'DASH', icon: 'grid' },
    { id: 'gantt', label: 'ガント', en: 'GANTT', icon: 'gantt' },
    { id: 'network', label: 'PERT', en: 'PERT', icon: 'network' },
  ];
  const Icon = ({ name, color }) => {
    const paths = {
      list: <path d="M3 4h10M3 8h10M3 12h10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>,
      grid: <><rect x="3" y="3" width="4" height="4" stroke={color} strokeWidth="1.3" fill="none"/>
              <rect x="9" y="3" width="4" height="4" stroke={color} strokeWidth="1.3" fill="none"/>
              <rect x="3" y="9" width="4" height="4" stroke={color} strokeWidth="1.3" fill="none"/>
              <rect x="9" y="9" width="4" height="4" stroke={color} strokeWidth="1.3" fill="none"/></>,
      gantt: <><rect x="2" y="3" width="6" height="2" rx="0.5" fill={color}/>
               <rect x="5" y="7" width="7" height="2" rx="0.5" fill={color}/>
               <rect x="3" y="11" width="5" height="2" rx="0.5" fill={color}/></>,
      network: <><circle cx="3" cy="4" r="1.5" fill={color}/>
                 <circle cx="13" cy="8" r="1.5" fill={color}/>
                 <circle cx="3" cy="12" r="1.5" fill={color}/>
                 <path d="M4.5 4L11.5 7M4.5 12L11.5 9" stroke={color} strokeWidth="1"/></>,
    };
    return <svg width="14" height="14" viewBox="0 0 16 16">{paths[name]}</svg>;
  };
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: RA_BG_ALT, borderRight: `1px solid ${RA_BORDER}`,
      padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
        color: RA_TEXT_FAINT, padding: '6px 10px 8px', textTransform: 'uppercase' }}>
        VIEWS
      </div>
      {items.map(it => {
        const active = it.id === activeView;
        return (
          <div key={it.id} onClick={() => setView(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 7,
            background: active ? RA_ACCENT : 'transparent',
            color: active ? '#fff' : RA_TEXT,
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <Icon name={it.icon} color={active ? '#fff' : RA_TEXT_MUTED} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.count != null && (
              <span style={{ fontFamily: RA_MONO, fontSize: 10,
                opacity: active ? 0.8 : 0.5 }}>{it.count}</span>
            )}
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 10, fontFamily: RA_MONO, color: RA_TEXT_FAINT, padding: '0 10px 6px' }}>
        {taskCount} tasks · {milestoneCount} milestones
      </div>
    </div>
  );
}

// ─── List view ─────────────────────────────────────────────────
function RealListView({ tasks, onEdit, onToggleDone, onAdd, project }) {
  const top = tasks.filter(t => !t.parent);
  const subOf = (id) => tasks.filter(t => t.parent === id);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 40px', background: RA_BG }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: RA_TEXT }}>
            タスク <span style={{ fontFamily: RA_MONO, fontWeight: 400, color: RA_TEXT_FAINT, fontSize: 13 }}>· {top.length}</span>
          </h2>
        </div>
        <window.AddTaskButton onAdd={() => onAdd(false)} label="+ タスク追加" />
        <button onClick={() => onAdd(true)} style={{
          marginLeft: 8, padding: '7px 12px', borderRadius: 8,
          border: `1px solid ${RA_BORDER}`, background: '#fff', color: RA_TEXT,
          fontFamily: RA_FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>+ マイルストーン</button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState project={project} onAdd={onAdd} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${RA_BORDER}`, overflow: 'hidden' }}>
          {/* header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 110px 110px 70px 80px 60px',
            padding: '10px 12px', gap: 8, alignItems: 'center',
            background: RA_BG_ALT, borderBottom: `1px solid ${RA_BORDER}`,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
            color: RA_TEXT_FAINT, textTransform: 'uppercase',
          }}>
            <span></span><span>タイトル</span><span>開始</span><span>期限</span><span>進捗</span><span>工数</span><span>優先</span>
          </div>
          {top.map(t => (
            <React.Fragment key={t.id}>
              <TaskRow t={t} onEdit={onEdit} onToggleDone={onToggleDone} />
              {subOf(t.id).map(sub => (
                <TaskRow key={sub.id} t={sub} indent={1} onEdit={onEdit} onToggleDone={onToggleDone} />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ t, indent = 0, onEdit, onToggleDone }) {
  const fmt = (d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; };
  const prio = { high: { l: '高', c: RA_DANGER }, med: { l: '中', c: RA_TEXT_MUTED }, low: { l: '低', c: RA_TEXT_FAINT } }[t.priority] || { l: '中', c: RA_TEXT_MUTED };
  return (
    <div onClick={() => onEdit(t)} style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 110px 110px 70px 80px 60px',
      padding: '10px 12px', gap: 8, alignItems: 'center',
      borderBottom: `1px solid ${RA_BORDER}`,
      cursor: 'pointer', background: '#fff',
      transition: 'background 0.1s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = RA_BG_ALT}
      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
      <div onClick={(e) => { e.stopPropagation(); if (!t.milestone) onToggleDone(t); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {t.milestone ? (
          <div style={{ width: 12, height: 12, transform: 'rotate(45deg)',
            background: RA_ACCENT, borderRadius: 1.5 }} />
        ) : (
          <div style={{
            width: 18, height: 18, borderRadius: 5, cursor: 'pointer',
            border: `1.5px solid ${t.progress === 100 ? RA_OK : RA_BORDER_STRONG}`,
            background: t.progress === 100 ? RA_OK : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {t.progress === 100 && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
      <div style={{ paddingLeft: indent * 18, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {indent > 0 && <span style={{ color: RA_TEXT_FAINT, fontSize: 11 }}>↳</span>}
        <span style={{
          fontSize: 13.5, color: RA_TEXT, fontWeight: t.milestone ? 600 : 500,
          textDecoration: t.progress === 100 && !t.milestone ? 'line-through' : 'none',
          opacity: t.progress === 100 && !t.milestone ? 0.55 : 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{t.title || '無題'}</span>
      </div>
      <span style={{ fontFamily: RA_MONO, fontSize: 12, color: RA_TEXT_MUTED }}>{fmt(t.start)}</span>
      <span style={{ fontFamily: RA_MONO, fontSize: 12, color: RA_TEXT_MUTED }}>{t.milestone ? '—' : fmt(t.end)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!t.milestone && (
          <>
            <div style={{ flex: 1, height: 4, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
              <div style={{ width: `${t.progress}%`, height: '100%',
                background: t.progress === 100 ? RA_OK : RA_ACCENT, borderRadius: 2 }} />
            </div>
            <span style={{ fontFamily: RA_MONO, fontSize: 10.5, color: RA_TEXT_MUTED, minWidth: 24, textAlign: 'right' }}>
              {t.progress}%
            </span>
          </>
        )}
      </div>
      <span style={{ fontFamily: RA_MONO, fontSize: 12, color: RA_TEXT_MUTED }}>
        {t.milestone ? '—' : `${t.hours}h`}
      </span>
      <span style={{ fontFamily: RA_MONO, fontSize: 11, color: prio.c, fontWeight: 600 }}>{prio.l}</span>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────
function EmptyState({ project, onAdd }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 48,
      border: `1px dashed ${RA_BORDER_STRONG}`, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 600, color: RA_TEXT }}>
        「{project?.name || 'プロジェクト'}」にタスクがありません
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: RA_TEXT_MUTED }}>
        最初のタスクを追加して始めましょう。
      </p>
      <window.AddTaskButton onAdd={() => onAdd(false)} label="+ タスクを追加" />
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────
function RealDash({ tasks, project }) {
  const stats = window.computeStats(tasks);
  const ms = tasks.filter(t => t.milestone).sort((a, b) => new Date(a.start) - new Date(b.start));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const thisWeek = tasks.filter(t => {
    if (t.milestone) return false;
    const s = new Date(t.start), e = new Date(t.end);
    return s <= weekEnd && e >= today;
  });

  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: 40, background: RA_BG }}>
        <EmptyState project={project} onAdd={() => {}} />
      </div>
    );
  }

  const Card = ({ title, children }) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 18,
      border: `1px solid ${RA_BORDER}`, boxShadow: '0 1px 2px rgba(20,15,30,0.03)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: RA_TEXT_FAINT,
        letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', background: RA_BG }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16,
      }}>
        <div style={{
          background: `linear-gradient(135deg, oklch(0.55 0.18 ${project?.hue || 295}), oklch(0.40 0.20 ${project?.hue || 295}))`,
          color: '#fff', borderRadius: 12, padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em',
            opacity: 0.75, fontFamily: RA_MONO, textTransform: 'uppercase' }}>
            OVERALL · 全体
          </div>
          <div style={{ marginTop: 8, fontSize: 56, fontWeight: 600, fontFamily: RA_MONO, lineHeight: 1 }}>
            {stats.avgProgress}<span style={{ fontSize: 24, opacity: 0.6 }}>%</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            {stats.done} / {stats.total} 完了 · {stats.doneHours}h / {stats.totalHours}h
          </div>
          <div style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,0.25)',
            borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${stats.avgProgress}%`, height: '100%',
              background: '#fff', borderRadius: 3 }} />
          </div>
        </div>
        <Card title="進捗サマリー">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: '完了', n: stats.done, c: RA_OK },
              { l: '進行中', n: stats.inProgress, c: 'oklch(0.65 0.18 80)' },
              { l: '未着手', n: stats.notStarted, c: RA_TEXT_FAINT },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: r.c }} />
                <span style={{ flex: 1, fontSize: 13, color: RA_TEXT }}>{r.l}</span>
                <span style={{ fontFamily: RA_MONO, fontSize: 14, fontWeight: 600, color: RA_TEXT }}>{r.n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title={`今週のタスク · ${thisWeek.length}件`}>
          {thisWeek.length === 0 ? (
            <div style={{ fontSize: 12, color: RA_TEXT_FAINT }}>今週の予定はありません</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {thisWeek.slice(0, 6).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 24, borderRadius: 2, background: RA_ACCENT }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: RA_TEXT, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: RA_TEXT_FAINT, fontFamily: RA_MONO }}>
                      {new Date(t.start).getMonth() + 1}/{new Date(t.start).getDate()} – {new Date(t.end).getMonth() + 1}/{new Date(t.end).getDate()} · {t.hours}h
                    </div>
                  </div>
                  <span style={{ fontFamily: RA_MONO, fontSize: 11, color: RA_TEXT_MUTED }}>{t.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title={`マイルストーン · ${ms.length}件`}>
          {ms.length === 0 ? (
            <div style={{ fontSize: 12, color: RA_TEXT_FAINT }}>マイルストーンなし</div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 16 }}>
              <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 1.5, background: RA_BORDER }} />
              {ms.map(m => {
                const days = Math.round((new Date(m.start) - today) / 86400000);
                return (
                  <div key={m.id} style={{ position: 'relative', marginBottom: 10 }}>
                    <div style={{ position: 'absolute', left: -16, top: 4, width: 9, height: 9,
                      transform: 'rotate(45deg)', background: RA_ACCENT }} />
                    <div style={{ fontSize: 13, color: RA_TEXT, fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: RA_TEXT_MUTED, fontFamily: RA_MONO }}>
                      {new Date(m.start).getMonth() + 1}/{new Date(m.start).getDate()} · {days < 0 ? `${-days}日前` : days === 0 ? '今日' : `+${days}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Gantt with drag ───────────────────────────────────────────
function RealGantt({ tasks, onEdit, updateTask, onAdd, project }) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: 40, background: RA_BG }}>
        <EmptyState project={project} onAdd={onAdd} />
      </div>
    );
  }
  const du = window.dateUtilsFor(tasks);
  const dayW = 22;
  const labelW = 220;
  const rowH = 30;
  const total = du.totalDays;
  const todayOff = du.todayOffset();
  const top = tasks.filter(t => !t.parent);

  // months
  const months = [];
  let cur = new Date(du.PROJECT_START);
  while (cur <= du.PROJECT_END) {
    const monStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const fromOff = Math.max(0, Math.round((monStart - du.PROJECT_START) / 86400000));
    const toOff = Math.min(total, Math.round((monEnd - du.PROJECT_START) / 86400000) + 1);
    months.push({ label: `${monStart.getFullYear()}/${monStart.getMonth() + 1}`, from: fromOff, days: toOff - fromOff });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const onDragStart = (t, mode) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const origStart = t.start, origEnd = t.end;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const days = Math.round(dx / dayW);
      if (mode === 'move') {
        updateTask(t.id, { start: du.addDays(origStart, days), end: du.addDays(origEnd, days) });
      } else if (mode === 'left') {
        const newStart = du.addDays(origStart, days);
        if (new Date(newStart) <= new Date(origEnd)) updateTask(t.id, { start: newStart });
      } else if (mode === 'right') {
        const newEnd = du.addDays(origEnd, days);
        if (new Date(newEnd) >= new Date(origStart)) updateTask(t.id, { end: newEnd });
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: RA_BG, minHeight: 0 }}>
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${RA_BORDER}` }}>
        <div style={{ flex: 1, fontSize: 12, color: RA_TEXT_MUTED }}>
          ↔ バーをドラッグで移動 / 端をドラッグで日数変更
        </div>
        <window.AddTaskButton onAdd={() => onAdd(false)} label="+ タスク追加" />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ minWidth: labelW + total * dayW, position: 'relative' }}>
          {/* month header */}
          <div style={{
            display: 'flex', position: 'sticky', top: 0, zIndex: 3,
            background: '#fff', borderBottom: `1px solid ${RA_BORDER}`,
            paddingLeft: labelW, height: 32,
          }}>
            {months.map((m, i) => (
              <div key={i} style={{
                width: m.days * dayW, padding: '8px 8px',
                fontSize: 11, fontWeight: 600, color: RA_TEXT,
                borderLeft: i > 0 ? `1px solid ${RA_BORDER}` : 'none',
              }}>{m.label}</div>
            ))}
          </div>
          {/* rows */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: labelW, top: 0,
              width: total * dayW, height: top.length * rowH, pointerEvents: 'none' }}>
              {todayOff >= 0 && todayOff <= total && (
                <line x1={todayOff * dayW + dayW / 2} x2={todayOff * dayW + dayW / 2}
                  y1={0} y2={top.length * rowH}
                  stroke={RA_ACCENT} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
              )}
            </svg>
            {top.map(t => {
              const startOff = du.dayOffset(t.start);
              const dur = du.duration(t.start, t.end);
              return (
                <div key={t.id} style={{
                  display: 'flex', height: rowH, position: 'relative',
                  borderBottom: `1px solid ${RA_BORDER}`,
                  background: '#fff',
                }}>
                  <div onClick={() => onEdit(t)} style={{
                    width: labelW, padding: '0 12px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12.5, color: RA_TEXT, fontWeight: 500,
                    borderRight: `1px solid ${RA_BORDER}`, cursor: 'pointer',
                    background: '#fff', position: 'sticky', left: 0, zIndex: 1,
                  }}>
                    {t.milestone && (
                      <div style={{ width: 8, height: 8, transform: 'rotate(45deg)', background: RA_ACCENT, flexShrink: 0 }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title || '無題'}
                    </span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    {t.milestone ? (
                      <div onClick={() => onEdit(t)} style={{
                        position: 'absolute', left: startOff * dayW + dayW / 2 - 7,
                        top: rowH / 2 - 7, width: 14, height: 14, transform: 'rotate(45deg)',
                        background: RA_ACCENT, cursor: 'pointer', borderRadius: 1.5,
                      }} />
                    ) : (
                      <div style={{
                        position: 'absolute', left: startOff * dayW + 1,
                        top: rowH / 2 - 9, height: 18, width: dur * dayW - 2,
                        borderRadius: 5, overflow: 'hidden',
                        background: 'oklch(0.92 0.04 295)',
                        border: `1px solid oklch(0.82 0.06 295)`,
                        cursor: 'grab', userSelect: 'none',
                      }}
                        onMouseDown={onDragStart(t, 'move')}
                        onClick={() => onEdit(t)}>
                        <div style={{ height: '100%', width: `${t.progress}%`,
                          background: t.progress === 100 ? RA_OK : RA_ACCENT, pointerEvents: 'none' }} />
                        {/* resize handles */}
                        <div onMouseDown={(e) => { e.stopPropagation(); onDragStart(t, 'left')(e); }}
                          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, cursor: 'ew-resize' }} />
                        <div onMouseDown={(e) => { e.stopPropagation(); onDragStart(t, 'right')(e); }}
                          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, cursor: 'ew-resize' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Simple PERT (cards by stage) ──────────────────────────────
function RealPert({ tasks, onEdit, onAdd, project }) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: 40, background: RA_BG }}>
        <EmptyState project={project} onAdd={onAdd} />
      </div>
    );
  }
  const top = tasks.filter(t => !t.parent);
  const ranks = {};
  function rank(id) {
    if (ranks[id] != null) return ranks[id];
    const t = top.find(x => x.id === id);
    if (!t) return 0;
    if (!t.deps || t.deps.length === 0) return ranks[id] = 0;
    return ranks[id] = Math.max(...t.deps.map(d => rank(d) + 1));
  }
  top.forEach(t => rank(t.id));
  const byRank = {};
  top.forEach(t => (byRank[ranks[t.id]] = byRank[ranks[t.id]] || []).push(t));
  const maxRank = Math.max(0, ...Object.keys(byRank).map(Number));

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', background: RA_BG }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, fontSize: 12, color: RA_TEXT_MUTED }}>
          依存関係に基づく実行ステージ
        </div>
        <window.AddTaskButton onAdd={() => onAdd(false)} label="+ タスク追加" />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 20 }}>
        {Array.from({ length: maxRank + 1 }, (_, r) => (
          <div key={r} style={{ minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 4px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: RA_ACCENT,
                color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: RA_MONO,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r + 1}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: RA_TEXT, letterSpacing: '0.06em' }}>STAGE {r + 1}</span>
            </div>
            {(byRank[r] || []).map(t => (
              <div key={t.id} onClick={() => onEdit(t)} style={{
                background: '#fff', borderRadius: 8, padding: '12px 14px',
                border: `1px solid ${RA_BORDER}`, cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(20,15,30,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {t.milestone && <div style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: RA_ACCENT }} />}
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: RA_TEXT_FAINT, letterSpacing: '0.06em', fontFamily: RA_MONO }}>
                    {t.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: RA_TEXT, marginBottom: 8 }}>{t.title || '無題'}</div>
                {!t.milestone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
                      <div style={{ width: `${t.progress}%`, height: '100%',
                        background: t.progress === 100 ? RA_OK : RA_ACCENT, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: RA_MONO, fontSize: 10, color: RA_TEXT_MUTED }}>{t.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toolbar ───────────────────────────────────────────────────
function RealToolbar({ project, syncStatus, projectControls }) {
  const labels = {
    'synced':  { t: '同期済み',   c: RA_OK },
    'saving':  { t: '保存中…',   c: 'oklch(0.65 0.18 80)' },
    'loading': { t: '読込中…',   c: 'oklch(0.65 0.18 80)' },
    'offline': { t: 'オフライン', c: RA_DANGER },
    'no-key':  { t: 'キーなし',   c: RA_TEXT_FAINT },
  };
  const s = labels[syncStatus] || labels.synced;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 24px', borderBottom: `1px solid ${RA_BORDER}`,
      background: '#fff',
    }}>
      {projectControls}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        background: 'rgba(20,15,30,0.04)',
        fontSize: 11, fontFamily: RA_MONO, color: RA_TEXT_MUTED,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
        {s.t}
      </div>
    </div>
  );
}

// ─── Real desktop app ──────────────────────────────────────────
function RealDesktopApp() {
  const app = window.useAppState();
  const [view, setView] = React.useState('list');
  const [editing, setEditing] = React.useState(null);
  const [askConfirm, confirmNode] = window.useConfirm();

  const onEdit = (t) => setEditing(t);
  const onAdd = (isMilestone) => setEditing(window.makeNewTask({ milestone: !!isMilestone }));

  const onSaveTask = (t) => {
    const exists = app.tasks.find(x => x.id === t.id);
    if (exists) app.updateTask(t.id, t);
    else app.addTask(t);
    setEditing(null);
  };
  const onDeleteTask = async (id) => {
    const ok = await askConfirm({
      title: 'タスクを削除',
      message: 'このタスクを削除します。サブタスクも削除されます。よろしいですか？',
      confirmLabel: '削除する',
    });
    if (ok) {
      app.deleteTask(id);
      setEditing(null);
    }
  };
  const onToggleDone = (t) => {
    app.updateTask(t.id, { progress: t.progress === 100 ? 0 : 100 });
  };

  if (!app.loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: RA_TEXT_FAINT }}>読込中…</div>;
  }

  const renderView = () => {
    if (view === 'list') return <RealListView tasks={app.tasks} onEdit={onEdit} onToggleDone={onToggleDone} onAdd={onAdd} project={app.activeProject} />;
    if (view === 'dash') return <RealDash tasks={app.tasks} project={app.activeProject} />;
    if (view === 'gantt') return <RealGantt tasks={app.tasks} onEdit={onEdit} updateTask={app.updateTask} onAdd={onAdd} project={app.activeProject} />;
    if (view === 'network') return <RealPert tasks={app.tasks} onEdit={onEdit} onAdd={onAdd} project={app.activeProject} />;
  };

  const ms = app.tasks.filter(t => t.milestone).length;
  const taskCount = app.tasks.filter(t => !t.milestone).length;

  return (
    <div style={{ display: 'flex', height: '100%', background: RA_BG, fontFamily: RA_FONT }}>
      <RealSidebar activeView={view} setView={setView}
        taskCount={taskCount} milestoneCount={ms} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <RealToolbar project={app.activeProject} syncStatus={app.syncStatus}
          projectControls={
            <window.ProjectSwitcher state={app.state}
              setActiveProject={app.setActiveProject}
              createProject={app.createProject}
              renameProject={app.renameProject}
              deleteProject={app.deleteProject}
              askConfirm={askConfirm} />
          } />
        {renderView()}
      </div>
      <window.TaskEditor open={!!editing} task={editing} allTasks={app.tasks}
        onSave={onSaveTask} onDelete={onDeleteTask} onClose={() => setEditing(null)}
        isMobile={false} />
      {confirmNode}
    </div>
  );
}

window.RealDesktopApp = RealDesktopApp;
