// iphone-app.jsx — iPhone version of the ToDo app
// Simplified for mobile: bottom tab bar, vertical scroll, touch-sized rows.

const IP = window.A_TOKENS;
const IPB = window.B_TOKENS;
const IPIcon = window.IconA;

function IOSStatusBarLight() {
  return <window.IOSStatusBar dark={false} />;
}

function iOSStatusBar({ dark }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px 8px', height: 44, flexShrink: 0,
      fontFamily: '-apple-system, "SF Pro", system-ui',
    }}>
      <span style={{ fontWeight: 600, fontSize: 15, color: c }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="16" height="10" viewBox="0 0 16 10">
          <rect x="0" y="6" width="2.6" height="3.5" rx="0.5" fill={c}/>
          <rect x="4" y="4" width="2.6" height="5.5" rx="0.5" fill={c}/>
          <rect x="8" y="2" width="2.6" height="7.5" rx="0.5" fill={c}/>
          <rect x="12" y="0" width="2.6" height="9.5" rx="0.5" fill={c}/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.2" fill={c}/>
        </svg>
        <svg width="22" height="10" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke={c} strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="1.5" fill={c}/>
        </svg>
      </div>
    </div>
  );
}

function IOSHomeIndicatorLocal({ dark }) {
  return (
    <div style={{ height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
      <div style={{ width: 134, height: 5, borderRadius: 3, background: dark ? '#fff' : '#000', opacity: 0.85 }} />
    </div>
  );
}

function IOSTabBar({ activeView, setView, variant }) {
  const tabs = [
    { id: 'list', label: 'リスト', icon: 'list' },
    { id: 'dash', label: 'ホーム', icon: 'grid' },
    { id: 'gantt', label: 'ガント', icon: 'gantt' },
    { id: 'network', label: 'PERT', icon: 'network' },
  ];
  const accent = variant === 'b' ? IPB.accent : IP.accent;
  return (
    <div style={{
      flexShrink: 0,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid rgba(20,15,30,0.10)`,
      padding: '6px 0 0',
    }}>
      <div style={{ display: 'flex' }}>
        {tabs.map(tab => {
          const active = tab.id === activeView;
          return (
            <div key={tab.id} onClick={() => setView(tab.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, padding: '6px 0',
              color: active ? accent : 'rgba(60,60,67,0.6)',
              cursor: 'default',
            }}>
              <IPIcon name={tab.icon} size={22} color={active ? accent : 'rgba(60,60,67,0.6)'} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Variant switch chip on iPhone (top right)
function IOSVariantChip({ variant, setVariant }) {
  return (
    <div style={{
      display: 'flex', height: 28, borderRadius: 8,
      background: 'rgba(20,15,30,0.05)', padding: 2, gap: 2,
    }}>
      {['a', 'b'].map(v => (
        <div key={v} onClick={() => setVariant(v)} style={{
          padding: '0 10px', display: 'flex', alignItems: 'center',
          fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'default',
          background: variant === v ? '#fff' : 'transparent',
          color: variant === v ? IP.text : IP.textMuted,
          boxShadow: variant === v ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
        }}>{v.toUpperCase()}</div>
      ))}
    </div>
  );
}

// ─── List View (mobile) ───────────────────────────────────────
function MobileList({ tasks, variant }) {
  const groupOrder = ['side', 'health', 'home'];
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 20px',
      background: variant === 'b' ? IPB.bg : IP.bg }}>
      {groupOrder.map(gKey => {
        const gTasks = tasks.filter(t => t.group === gKey && !t.parent);
        if (gTasks.length === 0) return null;
        const g = window.GROUPS[gKey];
        return (
          <div key={gKey} style={{ marginTop: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 4px 8px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 2,
                background: `oklch(0.65 0.14 ${g.hue})` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: IP.text }}>{g.name}</span>
              <span style={{ fontSize: 11, color: IP.textFaint, fontFamily: IP.mono }}>{gTasks.length}</span>
            </div>
            <div style={{
              background: '#fff', borderRadius: 12,
              boxShadow: '0 1px 2px rgba(20,15,30,0.04)',
              border: `0.5px solid ${IP.border}`, overflow: 'hidden',
            }}>
              {gTasks.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  borderBottom: i === gTasks.length - 1 ? 'none' : `0.5px solid ${IP.border}`,
                  background: t.milestone ? `oklch(0.97 0.025 ${g.hue})` : '#fff',
                }}>
                  {t.milestone ? (
                    <div style={{ width: 18, display: 'flex', justifyContent: 'center' }}>
                      <IPIcon name="diamond" size={12} color={`oklch(0.55 0.18 ${g.hue})`} />
                    </div>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `1.5px solid ${t.progress === 100 ? IP.ok : IP.borderStrong}`,
                      background: t.progress === 100 ? IP.ok : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.progress === 100 && <IPIcon name="check" size={12} color="#fff" />}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, color: IP.text, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      textDecoration: t.progress === 100 ? 'line-through' : 'none',
                      opacity: t.progress === 100 ? 0.55 : 1,
                    }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: IP.textMuted, fontFamily: IP.mono, marginTop: 2,
                      display: 'flex', gap: 8 }}>
                      <span>{window.dateUtils.fmt(t.start)}–{window.dateUtils.fmt(t.end)}</span>
                      {t.hours > 0 && <span>· {t.hours}h</span>}
                      {t.priority === 'high' && <span style={{ color: IP.danger }}>· 高</span>}
                    </div>
                  </div>
                  {!t.milestone && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontFamily: IP.mono, fontSize: 11, color: IP.textMuted }}>{t.progress}%</span>
                      <div style={{ width: 36, height: 3, background: 'rgba(20,15,30,0.08)', borderRadius: 2 }}>
                        <div style={{ width: `${t.progress}%`, height: '100%',
                          background: t.progress === 100 ? IP.ok : `oklch(0.55 0.18 ${g.hue})`,
                          borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard (mobile) ───────────────────────────────────────
function MobileDash({ tasks, variant }) {
  const stats = window.computeStats(tasks);
  const milestones = tasks.filter(t => t.milestone).sort((a, b) => new Date(a.start) - new Date(b.start));
  const today = new Date('2026-04-25');
  const weekEnd = new Date('2026-05-02');
  const thisWeek = tasks.filter(t => {
    if (t.milestone) return false;
    const s = new Date(t.start), e = new Date(t.end);
    return s <= weekEnd && e >= today;
  });
  const groupStats = Object.entries(window.GROUPS).map(([k, g]) => {
    const ts = tasks.filter(t => t.group === k && !t.milestone);
    const avg = Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length);
    return { ...g, key: k, count: ts.length, avg };
  });

  const Card = ({ title, sub, children }) => (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 16,
      border: `0.5px solid ${IP.border}`,
      boxShadow: '0 1px 2px rgba(20,15,30,0.04)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: IP.text }}>{title}</span>
        {sub && <span style={{ fontSize: 10, color: IP.textFaint, fontFamily: IP.mono }}>{sub}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 20px',
      background: variant === 'b' ? IPB.bg : IP.bg }}>
      {/* hero */}
      <div style={{
        background: variant === 'b'
          ? `linear-gradient(135deg, oklch(0.55 0.20 295), oklch(0.40 0.18 295))`
          : '#fff',
        color: variant === 'b' ? '#fff' : IP.text,
        borderRadius: 16, padding: 20, marginBottom: 12,
        border: variant === 'b' ? 'none' : `0.5px solid ${IP.border}`,
        boxShadow: variant === 'b'
          ? '0 4px 20px oklch(0.45 0.18 295 / 0.30)'
          : '0 1px 2px rgba(20,15,30,0.04)',
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
          opacity: 0.7, textTransform: 'uppercase', fontFamily: IP.mono }}>
          OVERALL · 全体
        </div>
        <div style={{ marginTop: 4, fontSize: 36, fontWeight: 600, fontFamily: IP.mono, lineHeight: 1.1 }}>
          {stats.avgProgress}<span style={{ fontSize: 18, opacity: 0.6 }}>%</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
          {stats.done} / {stats.total} 完了 · 残り64日
        </div>
        <div style={{ marginTop: 14, height: 6, background: variant === 'b' ? 'rgba(255,255,255,0.25)' : 'rgba(20,15,30,0.06)',
          borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${stats.avgProgress}%`, height: '100%',
            background: variant === 'b' ? '#fff' : IP.accent, borderRadius: 3 }} />
        </div>
      </div>

      {/* group cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {groupStats.map(g => (
          <div key={g.key} style={{
            background: '#fff', borderRadius: 12, padding: '12px 10px',
            border: `0.5px solid ${IP.border}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: `oklch(0.40 0.14 ${g.hue})`,
              letterSpacing: '0.05em' }}>{g.name}</div>
            <div style={{ marginTop: 4, fontFamily: IP.mono, fontSize: 22, fontWeight: 600, color: IP.text }}>
              {g.avg}<span style={{ fontSize: 11, color: IP.textMuted }}>%</span>
            </div>
            <div style={{ marginTop: 6, height: 3, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
              <div style={{ width: `${g.avg}%`, height: '100%',
                background: `oklch(0.55 0.16 ${g.hue})`, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <Card title="今週のタスク" sub={`THIS WEEK · ${thisWeek.length}件`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {thisWeek.slice(0, 5).map(t => {
            const g = window.GROUPS[t.group];
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0' }}>
                <div style={{ width: 4, height: 26, borderRadius: 2,
                  background: `oklch(0.65 0.14 ${g.hue})` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: IP.text, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: IP.textFaint, fontFamily: IP.mono }}>
                    {window.dateUtils.fmt(t.start)}–{window.dateUtils.fmt(t.end)} · {t.hours}h
                  </div>
                </div>
                <span style={{ fontFamily: IP.mono, fontSize: 11, color: IP.textMuted }}>{t.progress}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="マイルストーン" sub={`${milestones.length}件`}>
        <div style={{ position: 'relative', paddingLeft: 14 }}>
          <div style={{ position: 'absolute', left: 3, top: 4, bottom: 4, width: 1.5,
            background: IP.border }} />
          {milestones.map((m, i) => {
            const g = window.GROUPS[m.group];
            const days = Math.round((new Date(m.start) - new Date('2026-04-25')) / 86400000);
            return (
              <div key={m.id} style={{ position: 'relative',
                marginBottom: i === milestones.length - 1 ? 0 : 10 }}>
                <div style={{
                  position: 'absolute', left: -14, top: 4, width: 8, height: 8,
                  background: `oklch(0.55 0.18 ${g.hue})`, transform: 'rotate(45deg)',
                }} />
                <div style={{ fontSize: 12.5, color: IP.text, fontWeight: 500 }}>{m.title}</div>
                <div style={{ fontSize: 10.5, color: IP.textMuted, fontFamily: IP.mono }}>
                  {window.dateUtils.fmt(m.start)} · {days < 0 ? '完了' : `+${days}d`}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Mobile Gantt — vertical day rows, tasks as horizontal pills ──
function MobileGantt({ tasks, variant }) {
  const dayW = 14;
  const labelW = 130;
  const total = window.dateUtils.totalDays;
  const todayOff = window.dateUtils.todayOffset();

  const top = tasks.filter(t => !t.parent);

  // months for header
  const months = [];
  let cur = new Date(window.dateUtils.PROJECT_START);
  while (cur <= window.dateUtils.PROJECT_END) {
    const monStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const fromOff = Math.max(0, Math.round((monStart - window.dateUtils.PROJECT_START) / 86400000));
    const toOff = Math.min(total, Math.round((monEnd - window.dateUtils.PROJECT_START) / 86400000) + 1);
    months.push({ label: `${monStart.getMonth() + 1}月`, from: fromOff, days: toOff - fromOff });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const rowH = 32;

  return (
    <div style={{ flex: 1, overflow: 'auto',
      background: variant === 'b' ? IPB.bg : IP.bg, padding: '8px 12px 20px' }}>
      <div style={{
        background: '#fff', borderRadius: 12, overflow: 'auto',
        border: `0.5px solid ${IP.border}`,
      }}>
        <div style={{ width: labelW + total * dayW, position: 'relative' }}>
          {/* header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 2, background: '#fff',
            borderBottom: `0.5px solid ${IP.border}`, display: 'flex',
            paddingLeft: labelW, height: 26,
          }}>
            {months.map((m, i) => (
              <div key={i} style={{
                width: m.days * dayW, fontSize: 11, fontWeight: 600, color: IP.text,
                padding: '6px 6px', borderLeft: i > 0 ? `0.5px solid ${IP.border}` : 'none',
              }}>{m.label}</div>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: labelW, top: 0,
              width: total * dayW, height: top.length * rowH, pointerEvents: 'none' }}>
              <line x1={todayOff * dayW + dayW / 2} x2={todayOff * dayW + dayW / 2}
                y1={0} y2={top.length * rowH}
                stroke={variant === 'b' ? IPB.accent : IP.accent} strokeWidth="1.5" />
            </svg>

            {top.map(t => {
              const g = window.GROUPS[t.group];
              const startOff = window.dateUtils.dayOffset(t.start);
              const dur = window.dateUtils.duration(t.start, t.end);
              return (
                <div key={t.id} style={{
                  display: 'flex', height: rowH, position: 'relative',
                  borderBottom: `0.5px solid ${IP.border}`,
                }}>
                  <div style={{
                    position: 'sticky', left: 0, zIndex: 1, width: labelW,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 8px', background: '#fff',
                    borderRight: `0.5px solid ${IP.border}`,
                    fontSize: 11, color: IP.text, fontWeight: 500,
                  }}>
                    {t.milestone ? (
                      <IPIcon name="diamond" size={9} color={IP.accent} />
                    ) : (
                      <div style={{ width: 3, height: 14, borderRadius: 2,
                        background: `oklch(0.65 0.14 ${g.hue})`, flexShrink: 0 }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    {t.milestone ? (
                      <div style={{
                        position: 'absolute', left: startOff * dayW + dayW / 2 - 6,
                        top: rowH / 2 - 6, width: 12, height: 12,
                        background: `oklch(0.55 0.18 ${g.hue})`, transform: 'rotate(45deg)', borderRadius: 1.5,
                      }} />
                    ) : (
                      <div style={{
                        position: 'absolute', left: startOff * dayW + 1,
                        top: rowH / 2 - 9, height: 18,
                        width: dur * dayW - 2,
                        borderRadius: variant === 'b' ? 9 : 4, overflow: 'hidden',
                        background: variant === 'b'
                          ? `linear-gradient(180deg, oklch(0.94 0.04 ${g.hue}), oklch(0.88 0.06 ${g.hue}))`
                          : `oklch(0.88 0.07 ${g.hue})`,
                        border: variant === 'b' ? `0.5px solid oklch(0.78 0.08 ${g.hue})` : 'none',
                      }}>
                        <div style={{
                          height: '100%', width: `${t.progress}%`,
                          background: variant === 'b'
                            ? `linear-gradient(180deg, oklch(0.68 0.14 ${g.hue}), oklch(0.50 0.20 ${g.hue}))`
                            : `oklch(0.60 0.16 ${g.hue})`,
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: '0 4px', fontSize: 10.5, color: IP.textFaint,
        fontFamily: IP.mono, textAlign: 'center' }}>
        ↔ 横スクロールでタイムラインを確認
      </div>
    </div>
  );
}

// ─── Mobile PERT — simplified vertical stages ─────────────────
function MobileNetwork({ tasks, variant }) {
  const top = tasks.filter(t => !t.parent);
  const ranks = {};
  function rank(id) {
    if (ranks[id] != null) return ranks[id];
    const t = top.find(x => x.id === id);
    if (!t) return 0;
    if (t.deps.length === 0) return ranks[id] = 0;
    return ranks[id] = Math.max(...t.deps.map(d => rank(d) + 1));
  }
  top.forEach(t => rank(t.id));
  const byRank = {};
  top.forEach(t => (byRank[ranks[t.id]] = byRank[ranks[t.id]] || []).push(t));
  const maxRank = Math.max(...Object.keys(byRank).map(Number));

  // critical path
  const cpIds = (() => {
    const finishMs = top.find(t => t.id === 't12');
    if (!finishMs) return new Set();
    const cp = new Set([finishMs.id]);
    const stack = [finishMs.id];
    while (stack.length) {
      const id = stack.pop();
      const t = top.find(x => x.id === id);
      if (!t) continue;
      t.deps.forEach(d => { if (!cp.has(d)) { cp.add(d); stack.push(d); } });
    }
    return cp;
  })();

  return (
    <div style={{ flex: 1, overflow: 'auto',
      background: variant === 'b' ? IPB.bg : IP.bg, padding: '12px 16px 20px' }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '12px 14px',
        border: '0.5px solid oklch(0.90 0.04 295)',
        marginBottom: 12,
        background: variant === 'b'
          ? `linear-gradient(135deg, oklch(0.97 0.02 295), #fff)`
          : '#fff',
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
          color: IP.textFaint, textTransform: 'uppercase', fontFamily: IP.mono }}>
          Critical Path
        </div>
        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: IP.text }}>
          {cpIds.size} ノード · {top.filter(t => cpIds.has(t.id) && !t.milestone).reduce((s, t) => s + t.hours, 0)}時間
        </div>
      </div>

      {Array.from({ length: maxRank + 1 }, (_, r) => (
        <div key={r} style={{ marginBottom: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 8px',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: variant === 'b'
                ? `linear-gradient(135deg, oklch(0.62 0.20 295), oklch(0.42 0.20 295))`
                : IP.accent,
              color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: IP.mono,
            }}>{r + 1}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: IP.text,
              letterSpacing: '0.04em' }}>STAGE {r + 1}</span>
            <div style={{ flex: 1, height: 1, background: IP.border }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(byRank[r] || []).map(t => {
              const g = window.GROUPS[t.group];
              const isCP = cpIds.has(t.id);
              return (
                <div key={t.id} style={{
                  background: '#fff', borderRadius: 10,
                  padding: '10px 12px',
                  border: `${isCP ? 1.5 : 0.5}px solid ${isCP ? IP.accent : IP.border}`,
                  boxShadow: isCP ? `0 2px 8px oklch(0.50 0.18 295 / 0.12)` : '0 1px 2px rgba(20,15,30,0.04)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: `oklch(0.55 0.18 ${g.hue})`,
                  }} />
                  <div style={{ paddingLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.milestone && <IPIcon name="diamond" size={10} color={IP.accent} />}
                    <span style={{ fontSize: 9.5, fontWeight: 600,
                      color: `oklch(0.40 0.14 ${g.hue})`, letterSpacing: '0.06em',
                      textTransform: 'uppercase' }}>{g.en}</span>
                    {isCP && <span style={{ fontSize: 9, fontWeight: 700,
                      color: IP.accent, letterSpacing: '0.08em' }}>· CRITICAL</span>}
                    <span style={{ marginLeft: 'auto', fontFamily: IP.mono, fontSize: 9.5, color: IP.textFaint }}>
                      {t.id.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ paddingLeft: 6, marginTop: 4, fontSize: 13, fontWeight: 500, color: IP.text }}>
                    {t.title}
                  </div>
                  {!t.milestone && (
                    <div style={{ paddingLeft: 6, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
                        <div style={{ width: `${t.progress}%`, height: '100%',
                          background: t.progress === 100 ? IP.ok : `oklch(0.55 0.18 ${g.hue})`,
                          borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: IP.mono, fontSize: 10, color: IP.textMuted }}>{t.progress}%</span>
                      <span style={{ fontFamily: IP.mono, fontSize: 10, color: IP.textFaint }}>{t.hours}h</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── iPhone shell (standalone, demo data) ─────────────────────
function IPhoneApp() {
  const [view, setView] = React.useState('dash');
  const [variant, setVariant] = React.useState('a');
  const [tasks] = React.useState(window.SAMPLE_TASKS);

  const titleMap = {
    list: 'リスト',
    dash: 'パーソナル',
    gantt: 'タイムライン',
    network: 'PERT',
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: variant === 'b' ? IPB.bg : IP.bg,
      fontFamily: IP.font,
      overflow: 'hidden',
      paddingTop: 54,
    }}>
      <div style={{
        padding: '4px 16px 12px', display: 'flex', alignItems: 'flex-end',
        gap: 10, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
            color: IP.textFaint, textTransform: 'uppercase', fontFamily: IP.mono }}>
            Q2 · 2026
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, color: IP.text,
            letterSpacing: '-0.02em' }}>
            {titleMap[view]}
          </h1>
        </div>
        <IOSVariantChip variant={variant} setVariant={setVariant} />
      </div>
      {view === 'list' && <MobileList tasks={tasks} variant={variant} />}
      {view === 'dash' && <MobileDash tasks={tasks} variant={variant} />}
      {view === 'gantt' && <MobileGantt tasks={tasks} variant={variant} />}
      {view === 'network' && <MobileNetwork tasks={tasks} variant={variant} />}
      <IOSTabBar activeView={view} setView={setView} variant={variant} />
    </div>
  );
}

window.IPhoneApp = IPhoneApp;

// ─── iPhone shell (synced — accepts tasks/setTasks props) ─────
function IPhoneAppSynced({ tasks, setTasks }) {
  const [view, setView] = React.useState('dash');
  const [variant, setVariant] = React.useState('a');

  const titleMap = {
    list: 'リスト',
    dash: 'パーソナル',
    gantt: 'タイムライン',
    network: 'PERT',
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: variant === 'b' ? IPB.bg : IP.bg,
      fontFamily: IP.font,
      overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top, 8px)',
    }}>
      <div style={{
        padding: '12px 16px 12px', display: 'flex', alignItems: 'flex-end',
        gap: 10, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
            color: IP.textFaint, textTransform: 'uppercase', fontFamily: IP.mono }}>
            Q2 · 2026
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, color: IP.text,
            letterSpacing: '-0.02em' }}>
            {titleMap[view]}
          </h1>
        </div>
        <IOSVariantChip variant={variant} setVariant={setVariant} />
      </div>
      {view === 'list' && <MobileList tasks={tasks} variant={variant} />}
      {view === 'dash' && <MobileDash tasks={tasks} variant={variant} />}
      {view === 'gantt' && <MobileGantt tasks={tasks} variant={variant} />}
      {view === 'network' && <MobileNetwork tasks={tasks} variant={variant} />}
      <IOSTabBar activeView={view} setView={setView} variant={variant} />
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
window.IPhoneAppSynced = IPhoneAppSynced;
