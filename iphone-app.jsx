// iphone-app.jsx — Mobile app using real app-state (multi-project, CRUD).
// Exports: window.MobileApp

const MP_ACCENT = 'oklch(0.55 0.18 295)';
const MP_TEXT = '#1a1820';
const MP_TEXT_MUTED = '#6b6478';
const MP_TEXT_FAINT = '#9b94a8';
const MP_BG = '#f0eee9';
const MP_BG_CARD = '#fff';
const MP_BORDER = 'rgba(20,15,30,0.10)';
const MP_BORDER_STRONG = 'rgba(20,15,30,0.18)';
const MP_OK = 'oklch(0.65 0.16 165)';
const MP_DANGER = 'oklch(0.55 0.20 25)';
const MP_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';
const MP_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// ─── Tab bar ───────────────────────────────────────────────────
function MTabBar({ active, setView }) {
  const tabs = [
    { id: 'list', label: 'リスト' },
    { id: 'dash', label: 'ホーム' },
    { id: 'gantt', label: 'ガント' },
    { id: 'network', label: 'PERT' },
  ];
  const Icon = ({ id, color }) => {
    const s = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (id === 'list') return (
      <svg width="22" height="22" viewBox="0 0 22 22"><path d="M5 7h12M5 11h12M5 15h12" {...s}/></svg>
    );
    if (id === 'dash') return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="4" y="4" width="6" height="6" rx="1.2" {...s}/>
        <rect x="12" y="4" width="6" height="6" rx="1.2" {...s}/>
        <rect x="4" y="12" width="6" height="6" rx="1.2" {...s}/>
        <rect x="12" y="12" width="6" height="6" rx="1.2" {...s}/>
      </svg>
    );
    if (id === 'gantt') return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="3" y="6" width="7" height="2.5" rx="0.7" fill={color}/>
        <rect x="6" y="10" width="9" height="2.5" rx="0.7" fill={color}/>
        <rect x="4" y="14" width="6" height="2.5" rx="0.7" fill={color}/>
      </svg>
    );
    return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="4" cy="6" r="2" fill={color}/>
        <circle cx="18" cy="11" r="2" fill={color}/>
        <circle cx="4" cy="16" r="2" fill={color}/>
        <path d="M5.5 6.5L16.5 10.5M5.5 15.5L16.5 11.5" stroke={color} strokeWidth="1.2"/>
      </svg>
    );
  };
  return (
    <div style={{
      flexShrink: 0, background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid ${MP_BORDER}`,
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    }}>
      <div style={{ display: 'flex', padding: '6px 0 0' }}>
        {tabs.map(t => {
          const on = t.id === active;
          const c = on ? MP_ACCENT : 'rgba(60,60,67,0.6)';
          return (
            <div key={t.id} onClick={() => setView(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, padding: '6px 0',
              color: c, cursor: 'pointer',
            }}>
              <Icon id={t.id} color={c} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Project switcher (mobile sheet) ───────────────────────────
function MProjectSheet({ open, state, setActive, onCreate, onDelete, onClose, askConfirm }) {
  if (!open) return null;
  const list = state.projectOrder.map(id => state.projects[id]).filter(Boolean);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(20,15,30,0.40)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', width: '100%', borderRadius: '16px 16px 0 0',
        padding: '12px 0 calc(env(safe-area-inset-bottom, 12px) + 12px)',
        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        fontFamily: MP_FONT,
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(20,15,30,0.20)',
          borderRadius: 2, margin: '0 auto 8px' }} />
        <div style={{ padding: '8px 20px 12px',
          fontSize: 10, fontWeight: 600, color: MP_TEXT_FAINT, letterSpacing: '0.06em' }}>
          PROJECTS · {list.length}
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {list.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
              borderTop: `0.5px solid ${MP_BORDER}`,
              background: p.id === state.activeProjectId ? 'rgba(20,15,30,0.04)' : 'transparent',
            }}
              onClick={() => { setActive(p.id); onClose(); }}>
              <span style={{ width: 10, height: 10, borderRadius: 2,
                background: `oklch(0.60 0.16 ${p.hue})` }} />
              <span style={{ flex: 1, fontSize: 15, color: MP_TEXT, fontWeight: 500 }}>
                {p.name}
              </span>
              <span style={{ fontFamily: MP_MONO, fontSize: 11, color: MP_TEXT_FAINT }}>
                {(state.tasksByProject[p.id] || []).length}
              </span>
              <button onClick={async (e) => {
                e.stopPropagation();
                const ok = await askConfirm({
                  title: 'プロジェクトを削除',
                  message: `「${p.name}」とすべてのタスクを削除します。`,
                  confirmLabel: '削除する',
                });
                if (ok) onDelete(p.id);
              }} style={{
                width: 30, height: 30, padding: 0, border: 'none',
                background: 'transparent', cursor: 'pointer', opacity: 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M3.5 5v6h7V5M2.5 4h9M5.5 4V3h3v1" stroke={MP_TEXT}
                    strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div onClick={onCreate} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 20px', borderTop: `0.5px solid ${MP_BORDER}`,
          color: MP_ACCENT, fontWeight: 600, fontSize: 15, cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke={MP_ACCENT} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          新規プロジェクト
        </div>
      </div>
    </div>
  );
}

// ─── List (mobile) ─────────────────────────────────────────────
function MList({ tasks, onEdit, onToggleDone, onAdd }) {
  const top = tasks.filter(t => !t.parent);
  const subOf = (id) => tasks.filter(t => t.parent === id);
  const fmt = (d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; };

  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: '20px 16px', overflow: 'auto', background: MP_BG }}>
        <MEmpty onAdd={onAdd} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 100px', background: MP_BG }}>
      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        border: `0.5px solid ${MP_BORDER}`,
      }}>
        {top.map((t, i) => (
          <React.Fragment key={t.id}>
            <MRow t={t} indent={0} last={i === top.length - 1 && subOf(t.id).length === 0}
              onEdit={onEdit} onToggleDone={onToggleDone} fmt={fmt} />
            {subOf(t.id).map((s, j, a) => (
              <MRow key={s.id} t={s} indent={1}
                last={i === top.length - 1 && j === a.length - 1}
                onEdit={onEdit} onToggleDone={onToggleDone} fmt={fmt} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function MRow({ t, indent, last, onEdit, onToggleDone, fmt }) {
  return (
    <div onClick={() => onEdit(t)} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px', paddingLeft: 14 + indent * 22,
      borderBottom: last ? 'none' : `0.5px solid ${MP_BORDER}`,
      background: '#fff', cursor: 'pointer',
    }}>
      <div onClick={(e) => { e.stopPropagation(); if (!t.milestone) onToggleDone(t); }}>
        {t.milestone ? (
          <div style={{ width: 14, height: 14, transform: 'rotate(45deg)',
            background: MP_ACCENT, borderRadius: 1.5 }} />
        ) : (
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            border: `1.6px solid ${t.progress === 100 ? MP_OK : MP_BORDER_STRONG}`,
            background: t.progress === 100 ? MP_OK : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {t.progress === 100 && (
              <svg width="13" height="13" viewBox="0 0 12 12">
                <path d="M2.5 6.5l2.5 2 4.5-4.5" stroke="#fff" strokeWidth="1.8"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, color: MP_TEXT, fontWeight: t.milestone ? 600 : 500,
          textDecoration: t.progress === 100 && !t.milestone ? 'line-through' : 'none',
          opacity: t.progress === 100 && !t.milestone ? 0.55 : 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{t.title || '無題'}</div>
        <div style={{ fontSize: 11.5, color: MP_TEXT_MUTED, fontFamily: MP_MONO,
          marginTop: 2, display: 'flex', gap: 8 }}>
          <span>{fmt(t.start)}{!t.milestone && '–' + fmt(t.end)}</span>
          {!t.milestone && t.hours > 0 && <span>· {t.hours}h</span>}
          {t.priority === 'high' && <span style={{ color: MP_DANGER }}>· 高</span>}
        </div>
      </div>
      {!t.milestone && (
        <div style={{ display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: MP_MONO, fontSize: 11, color: MP_TEXT_MUTED }}>
            {t.progress}%
          </span>
          <div style={{ width: 38, height: 3, background: 'rgba(20,15,30,0.08)',
            borderRadius: 2 }}>
            <div style={{ width: `${t.progress}%`, height: '100%',
              background: t.progress === 100 ? MP_OK : MP_ACCENT, borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty state (mobile) ──────────────────────────────────────
function MEmpty({ onAdd }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '40px 24px',
      border: `1px dashed ${MP_BORDER_STRONG}`, textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: MP_TEXT, marginBottom: 6 }}>
        タスクがありません
      </div>
      <div style={{ fontSize: 13, color: MP_TEXT_MUTED, marginBottom: 18 }}>
        最初のタスクを追加して始めましょう
      </div>
      <button onClick={onAdd} style={{
        padding: '10px 20px', borderRadius: 10, border: 'none',
        background: MP_ACCENT, color: '#fff', fontFamily: MP_FONT,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>+ タスクを追加</button>
    </div>
  );
}

// ─── Dashboard (mobile) ────────────────────────────────────────
function MDash({ tasks, project, onAdd }) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: '20px 16px', overflow: 'auto', background: MP_BG }}>
        <MEmpty onAdd={onAdd} />
      </div>
    );
  }
  const stats = window.computeStats(tasks);
  const ms = tasks.filter(t => t.milestone).sort((a, b) => new Date(a.start) - new Date(b.start));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const thisWeek = tasks.filter(t => {
    if (t.milestone) return false;
    const s = new Date(t.start), e = new Date(t.end);
    return s <= weekEnd && e >= today;
  });
  const hue = project?.hue || 295;
  const Card = ({ title, sub, children }) => (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
      border: `0.5px solid ${MP_BORDER}`,
      boxShadow: '0 1px 2px rgba(20,15,30,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: MP_TEXT }}>{title}</span>
        {sub && <span style={{ fontSize: 10.5, color: MP_TEXT_FAINT, fontFamily: MP_MONO }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 100px', background: MP_BG }}>
      <div style={{
        background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}), oklch(0.40 0.20 ${hue}))`,
        color: '#fff', borderRadius: 16, padding: 20, marginBottom: 12,
        boxShadow: `0 4px 20px oklch(0.45 0.18 ${hue} / 0.30)`,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
          opacity: 0.75, fontFamily: MP_MONO }}>OVERALL · 全体</div>
        <div style={{ marginTop: 4, fontSize: 40, fontWeight: 600, fontFamily: MP_MONO, lineHeight: 1.05 }}>
          {stats.avgProgress}<span style={{ fontSize: 18, opacity: 0.6 }}>%</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, opacity: 0.85 }}>
          {stats.done} / {stats.total} 完了 · {stats.doneHours}h / {stats.totalHours}h
        </div>
        <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.25)',
          borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${stats.avgProgress}%`, height: '100%',
            background: '#fff', borderRadius: 3 }} />
        </div>
      </div>

      <Card title="進捗サマリー">
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { l: '完了',    n: stats.done,       c: MP_OK },
            { l: '進行中',  n: stats.inProgress, c: 'oklch(0.65 0.18 80)' },
            { l: '未着手',  n: stats.notStarted, c: MP_TEXT_FAINT },
          ].map(r => (
            <div key={r.l} style={{ flex: 1, padding: '10px 8px',
              background: 'rgba(20,15,30,0.03)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: MP_MONO, fontSize: 22, fontWeight: 700, color: r.c }}>{r.n}</div>
              <div style={{ fontSize: 10.5, color: MP_TEXT_MUTED, marginTop: 2 }}>{r.l}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="今週のタスク" sub={`${thisWeek.length}件`}>
        {thisWeek.length === 0 ? (
          <div style={{ fontSize: 12, color: MP_TEXT_FAINT }}>今週の予定はありません</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {thisWeek.slice(0, 5).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0' }}>
                <div style={{ width: 4, height: 26, borderRadius: 2,
                  background: `oklch(0.65 0.14 ${hue})` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: MP_TEXT, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: MP_TEXT_FAINT, fontFamily: MP_MONO }}>
                    {new Date(t.start).getMonth() + 1}/{new Date(t.start).getDate()}–{new Date(t.end).getMonth() + 1}/{new Date(t.end).getDate()} · {t.hours}h
                  </div>
                </div>
                <span style={{ fontFamily: MP_MONO, fontSize: 11, color: MP_TEXT_MUTED }}>{t.progress}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="マイルストーン" sub={`${ms.length}件`}>
        {ms.length === 0 ? (
          <div style={{ fontSize: 12, color: MP_TEXT_FAINT }}>マイルストーンなし</div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 14 }}>
            <div style={{ position: 'absolute', left: 3, top: 4, bottom: 4, width: 1.5, background: MP_BORDER }} />
            {ms.map((m, i) => {
              const days = Math.round((new Date(m.start) - today) / 86400000);
              return (
                <div key={m.id} style={{ position: 'relative',
                  marginBottom: i === ms.length - 1 ? 0 : 10 }}>
                  <div style={{ position: 'absolute', left: -14, top: 4, width: 8, height: 8,
                    transform: 'rotate(45deg)', background: MP_ACCENT }} />
                  <div style={{ fontSize: 13, color: MP_TEXT, fontWeight: 500 }}>{m.title}</div>
                  <div style={{ fontSize: 10.5, color: MP_TEXT_MUTED, fontFamily: MP_MONO }}>
                    {new Date(m.start).getMonth() + 1}/{new Date(m.start).getDate()} ·
                    {' '}{days < 0 ? `${-days}日前` : days === 0 ? '今日' : `+${days}d`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Gantt (mobile, draggable) ─────────────────────────────────
function MGantt({ tasks, project, onEdit, updateTask, onAdd }) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: '20px 16px', overflow: 'auto', background: MP_BG }}>
        <MEmpty onAdd={onAdd} />
      </div>
    );
  }
  const du = window.dateUtilsFor(tasks);
  const dayW = 16;
  const labelW = 110;
  const rowH = 34;
  const total = du.totalDays;
  const todayOff = du.todayOffset();
  const top = tasks.filter(t => !t.parent);
  const hue = project?.hue || 295;

  const months = [];
  let cur = new Date(du.PROJECT_START);
  while (cur <= du.PROJECT_END) {
    const monStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const fromOff = Math.max(0, Math.round((monStart - du.PROJECT_START) / 86400000));
    const toOff = Math.min(total, Math.round((monEnd - du.PROJECT_START) / 86400000) + 1);
    months.push({ label: `${monStart.getMonth() + 1}月`, days: toOff - fromOff });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const onTouchDrag = (t, mode) => (e) => {
    e.stopPropagation();
    const startX = (e.touches?.[0] || e).clientX;
    const origStart = t.start, origEnd = t.end;
    const move = (ev) => {
      const x = (ev.touches?.[0] || ev).clientX;
      const days = Math.round((x - startX) / dayW);
      if (mode === 'move') {
        updateTask(t.id, { start: du.addDays(origStart, days), end: du.addDays(origEnd, days) });
      } else if (mode === 'left') {
        const ns = du.addDays(origStart, days);
        if (new Date(ns) <= new Date(origEnd)) updateTask(t.id, { start: ns });
      } else if (mode === 'right') {
        const ne = du.addDays(origEnd, days);
        if (new Date(ne) >= new Date(origStart)) updateTask(t.id, { end: ne });
      }
    };
    const up = () => {
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: MP_BG, padding: '8px 12px 100px' }}>
      <div style={{ background: '#fff', borderRadius: 12, border: `0.5px solid ${MP_BORDER}`, overflow: 'auto' }}>
        <div style={{ width: labelW + total * dayW, position: 'relative' }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 2, background: '#fff',
            borderBottom: `0.5px solid ${MP_BORDER}`, display: 'flex',
            paddingLeft: labelW, height: 28,
          }}>
            {months.map((m, i) => (
              <div key={i} style={{
                width: m.days * dayW, fontSize: 11, fontWeight: 600, color: MP_TEXT,
                padding: '6px 6px', borderLeft: i > 0 ? `0.5px solid ${MP_BORDER}` : 'none',
              }}>{m.label}</div>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: labelW, top: 0,
              width: total * dayW, height: top.length * rowH, pointerEvents: 'none' }}>
              {todayOff >= 0 && todayOff <= total && (
                <line x1={todayOff * dayW + dayW / 2} x2={todayOff * dayW + dayW / 2}
                  y1={0} y2={top.length * rowH}
                  stroke={MP_ACCENT} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
              )}
            </svg>
            {top.map(t => {
              const startOff = du.dayOffset(t.start);
              const dur = du.duration(t.start, t.end);
              return (
                <div key={t.id} style={{
                  display: 'flex', height: rowH, position: 'relative',
                  borderBottom: `0.5px solid ${MP_BORDER}`,
                }}>
                  <div onClick={() => onEdit(t)} style={{
                    position: 'sticky', left: 0, zIndex: 1, width: labelW,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 8px', background: '#fff',
                    borderRight: `0.5px solid ${MP_BORDER}`,
                    fontSize: 11.5, color: MP_TEXT, fontWeight: 500,
                  }}>
                    {t.milestone && <div style={{ width: 8, height: 8, transform: 'rotate(45deg)',
                      background: MP_ACCENT, flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title || '無題'}
                    </span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    {t.milestone ? (
                      <div onClick={() => onEdit(t)} style={{
                        position: 'absolute', left: startOff * dayW + dayW / 2 - 7,
                        top: rowH / 2 - 7, width: 14, height: 14,
                        background: MP_ACCENT, transform: 'rotate(45deg)', borderRadius: 1.5,
                      }} />
                    ) : (
                      <div onTouchStart={onTouchDrag(t, 'move')}
                        onMouseDown={onTouchDrag(t, 'move')}
                        onClick={(e) => { e.stopPropagation(); onEdit(t); }} style={{
                        position: 'absolute', left: startOff * dayW + 1,
                        top: rowH / 2 - 10, height: 20, width: dur * dayW - 2,
                        borderRadius: 6, overflow: 'hidden', userSelect: 'none',
                        background: `oklch(0.92 0.05 ${hue})`,
                        border: `1px solid oklch(0.82 0.07 ${hue})`,
                      }}>
                        <div style={{ height: '100%', width: `${t.progress}%`,
                          background: t.progress === 100 ? MP_OK : `oklch(0.55 0.18 ${hue})`, pointerEvents: 'none' }} />
                        <div onTouchStart={(e) => { e.stopPropagation(); onTouchDrag(t, 'left')(e); }}
                          onMouseDown={(e) => { e.stopPropagation(); onTouchDrag(t, 'left')(e); }}
                          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8 }} />
                        <div onTouchStart={(e) => { e.stopPropagation(); onTouchDrag(t, 'right')(e); }}
                          onMouseDown={(e) => { e.stopPropagation(); onTouchDrag(t, 'right')(e); }}
                          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8 }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: '0 4px', fontSize: 11, color: MP_TEXT_FAINT,
        fontFamily: MP_MONO, textAlign: 'center' }}>
        ↔ バーをドラッグで日程変更 / タップで編集
      </div>
    </div>
  );
}

// ─── PERT (mobile) ─────────────────────────────────────────────
function MPert({ tasks, project, onEdit, onAdd }) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, padding: '20px 16px', overflow: 'auto', background: MP_BG }}>
        <MEmpty onAdd={onAdd} />
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
  const hue = project?.hue || 295;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: MP_BG, padding: '8px 16px 100px' }}>
      {Array.from({ length: maxRank + 1 }, (_, r) => (
        <div key={r} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 8px' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: MP_ACCENT, color: '#fff',
              fontSize: 11, fontWeight: 700, fontFamily: MP_MONO,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{r + 1}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: MP_TEXT,
              letterSpacing: '0.04em' }}>STAGE {r + 1}</span>
            <div style={{ flex: 1, height: 1, background: MP_BORDER }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(byRank[r] || []).map(t => (
              <div key={t.id} onClick={() => onEdit(t)} style={{
                background: '#fff', borderRadius: 10, padding: '12px 14px',
                border: `0.5px solid ${MP_BORDER}`,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(20,15,30,0.04)',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                  background: `oklch(0.55 0.18 ${hue})` }} />
                <div style={{ paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.milestone && <div style={{ width: 8, height: 8, transform: 'rotate(45deg)',
                    background: MP_ACCENT }} />}
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: MP_TEXT_FAINT,
                    letterSpacing: '0.06em', fontFamily: MP_MONO }}>{t.id.slice(0, 6).toUpperCase()}</span>
                </div>
                <div style={{ paddingLeft: 8, marginTop: 4, fontSize: 14, fontWeight: 500, color: MP_TEXT }}>
                  {t.title || '無題'}
                </div>
                {!t.milestone && (
                  <div style={{ paddingLeft: 8, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
                      <div style={{ width: `${t.progress}%`, height: '100%',
                        background: t.progress === 100 ? MP_OK : `oklch(0.55 0.18 ${hue})`, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: MP_MONO, fontSize: 10, color: MP_TEXT_MUTED }}>{t.progress}%</span>
                    <span style={{ fontFamily: MP_MONO, fontSize: 10, color: MP_TEXT_FAINT }}>{t.hours}h</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile App ────────────────────────────────────────────────
function MobileApp() {
  const app = window.useAppState();
  const [view, setView] = React.useState('list');
  const [editing, setEditing] = React.useState(null);
  const [projOpen, setProjOpen] = React.useState(false);
  const [askConfirm, confirmNode] = window.useConfirm();

  const onEdit = (t) => setEditing(t);
  const onAdd = (isMilestone = false) => setEditing(window.makeNewTask({ milestone: !!isMilestone }));
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
  const onToggleDone = (t) => app.updateTask(t.id, { progress: t.progress === 100 ? 0 : 100 });
  const onCreateProject = () => {
    const name = window.prompt('新規プロジェクト名', '');
    if (name && name.trim()) {
      app.createProject(name.trim());
      setProjOpen(false);
    }
  };

  if (!app.loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', color: MP_TEXT_FAINT, fontSize: 13 }}>読込中…</div>;
  }

  const titleMap = { list: 'リスト', dash: 'ホーム', gantt: 'ガント', network: 'PERT' };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: MP_BG, fontFamily: MP_FONT, overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      {/* header */}
      <div style={{ padding: '14px 16px 12px', display: 'flex',
        alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={() => setProjOpen(true)} style={{ display: 'flex', alignItems: 'center',
            gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            color: MP_TEXT_MUTED, fontFamily: MP_MONO, cursor: 'pointer' }}>
            <span style={{ width: 7, height: 7, borderRadius: 1.5,
              background: `oklch(0.60 0.16 ${app.activeProject?.hue || 295})` }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {app.activeProject?.name || '—'}
            </span>
            <svg width="9" height="9" viewBox="0 0 10 10">
              <path d="M2 4l3 3 3-3" stroke={MP_TEXT_MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, color: MP_TEXT,
            letterSpacing: '-0.02em' }}>{titleMap[view]}</h1>
        </div>
        <button onClick={() => onAdd(false)} style={{
          width: 38, height: 38, borderRadius: 10, border: 'none',
          background: MP_ACCENT, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 3v12M3 9h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {view === 'list' && <MList tasks={app.tasks} onEdit={onEdit} onToggleDone={onToggleDone} onAdd={() => onAdd(false)} />}
      {view === 'dash' && <MDash tasks={app.tasks} project={app.activeProject} onAdd={() => onAdd(false)} />}
      {view === 'gantt' && <MGantt tasks={app.tasks} project={app.activeProject} onEdit={onEdit} updateTask={app.updateTask} onAdd={() => onAdd(false)} />}
      {view === 'network' && <MPert tasks={app.tasks} project={app.activeProject} onEdit={onEdit} onAdd={() => onAdd(false)} />}

      <MTabBar active={view} setView={setView} />

      <window.TaskEditor open={!!editing} task={editing} allTasks={app.tasks}
        onSave={onSaveTask} onDelete={onDeleteTask} onClose={() => setEditing(null)} isMobile={true} />
      <MProjectSheet open={projOpen} state={app.state}
        setActive={app.setActiveProject} onCreate={onCreateProject} onDelete={app.deleteProject}
        onClose={() => setProjOpen(false)} askConfirm={askConfirm} />
      {confirmNode}
    </div>
  );
}

window.MobileApp = MobileApp;
