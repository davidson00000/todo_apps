// app-b-gantt.jsx — 案B "Aurora": Gantt + Network (visual emphasis)
const { B_TOKENS: BG, IconB: BGIcon } = window;

// ─── Gantt B — pillowy bars on warm canvas ────────────────────
function GanttViewB({ tasks, density, onTaskUpdate }) {
  const labelW = 240;
  const dayW = density === 'compact' ? 16 : density === 'comfy' ? 24 : 20;
  const rowH = density === 'compact' ? 32 : density === 'comfy' ? 44 : 38;
  const total = window.dateUtils.totalDays;
  const todayOff = window.dateUtils.todayOffset();

  const [drag, setDrag] = React.useState(null);

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const dx = e.clientX - drag.startX;
      const days = Math.round(dx / dayW);
      let newStart = drag.origStart, newEnd = drag.origEnd;
      if (drag.mode === 'move') {
        newStart = window.dateUtils.addDays(drag.origStart, days);
        newEnd = window.dateUtils.addDays(drag.origEnd, days);
      } else if (drag.mode === 'resize-l') {
        newStart = window.dateUtils.addDays(drag.origStart, days);
      } else if (drag.mode === 'resize-r') {
        newEnd = window.dateUtils.addDays(drag.origEnd, days);
      }
      onTaskUpdate(drag.id, { start: newStart, end: newEnd });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, dayW, onTaskUpdate]);

  const months = [];
  let cur = new Date(window.dateUtils.PROJECT_START);
  while (cur <= window.dateUtils.PROJECT_END) {
    const monStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const fromOff = Math.max(0, Math.round((monStart - window.dateUtils.PROJECT_START) / 86400000));
    const toOff = Math.min(total, Math.round((monEnd - window.dateUtils.PROJECT_START) / 86400000) + 1);
    months.push({ label: `${monStart.getMonth() + 1}月`, year: monStart.getFullYear(), from: fromOff, days: toOff - fromOff });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const weekTicks = [];
  for (let d = 0; d <= total; d++) {
    const dt = new Date(window.dateUtils.PROJECT_START);
    dt.setDate(dt.getDate() + d);
    if (dt.getDay() === 1) weekTicks.push({ off: d, label: `${dt.getMonth() + 1}/${dt.getDate()}` });
  }

  const rowIndex = {};
  tasks.forEach((t, i) => rowIndex[t.id] = i);
  const totalWidth = labelW + total * dayW;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: BG.bg, padding: '12px 12px 60px' }}>
      <div style={{
        background: BG.panel, borderRadius: 12, overflow: 'auto',
        border: `1px solid ${BG.border}`, boxShadow: '0 1px 3px rgba(40,30,55,0.04)',
      }}>
        <div style={{ width: totalWidth, position: 'relative' }}>
          {/* header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 3, background: BG.panel,
            borderBottom: `1px solid ${BG.border}` }}>
            <div style={{ display: 'flex', height: 28, paddingLeft: labelW }}>
              {months.map((m, i) => (
                <div key={i} style={{
                  width: m.days * dayW, fontSize: 12, fontWeight: 600, color: BG.text,
                  padding: '6px 10px', borderLeft: i > 0 ? `1px solid ${BG.border}` : 'none',
                  fontFamily: BG.font,
                }}>
                  {m.label} <span style={{ fontSize: 10, color: BG.textFaint, fontFamily: BG.mono }}>{m.year}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', height: 22, paddingLeft: labelW, position: 'relative',
              borderTop: `1px solid ${BG.border}` }}>
              {weekTicks.map((w, i) => (
                <div key={i} style={{
                  position: 'absolute', left: labelW + w.off * dayW,
                  fontSize: 10, color: BG.textFaint, fontFamily: BG.mono, padding: '4px 0 0 4px',
                }}>{w.label}</div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: 0, top: 0, width: labelW, height: 50,
              display: 'flex', alignItems: 'center', padding: '0 18px',
              borderRight: `1px solid ${BG.border}`, background: BG.panel,
              fontSize: 11, fontWeight: 600, color: BG.textMuted, letterSpacing: '0.06em',
              textTransform: 'uppercase' }}>
              タスク
            </div>
          </div>

          {/* body */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: labelW, top: 0,
              width: total * dayW, height: tasks.length * rowH, pointerEvents: 'none' }}>
              {/* weekend stripes */}
              {Array.from({ length: total + 1 }, (_, d) => {
                const dt = new Date(window.dateUtils.PROJECT_START);
                dt.setDate(dt.getDate() + d);
                if (dt.getDay() === 0 || dt.getDay() === 6) {
                  return <rect key={d} x={d * dayW} y={0} width={dayW} height="100%"
                    fill="oklch(0.97 0.012 295)" />;
                }
                return null;
              })}
              {weekTicks.map((w, i) => (
                <line key={i} x1={w.off * dayW} x2={w.off * dayW} y1={0} y2={tasks.length * rowH}
                  stroke={BG.border} />
              ))}
              {/* today shaded band */}
              <rect x={todayOff * dayW} y={0} width={dayW} height="100%"
                fill="oklch(0.55 0.20 295)" opacity="0.06" />
              <line x1={todayOff * dayW + dayW / 2} x2={todayOff * dayW + dayW / 2}
                y1={0} y2={tasks.length * rowH} stroke={BG.accent} strokeWidth="1.5" />

              {/* dependency arrows */}
              {tasks.map((t) => t.deps.map(depId => {
                const dep = tasks.find(x => x.id === depId);
                if (!dep) return null;
                const fromX = (window.dateUtils.dayOffset(dep.end) + 1) * dayW;
                const fromY = rowIndex[depId] * rowH + rowH / 2;
                const toX = window.dateUtils.dayOffset(t.start) * dayW;
                const toY = rowIndex[t.id] * rowH + rowH / 2;
                const midX = Math.max(fromX + 8, toX - 8);
                const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX - 5} ${toY}`;
                return (
                  <g key={`${depId}-${t.id}`} opacity="0.6">
                    <path d={path} stroke={BG.accentMid} strokeWidth="1.2" fill="none" />
                    <path d={`M ${toX - 5} ${toY - 3} L ${toX} ${toY} L ${toX - 5} ${toY + 3} Z`} fill={BG.accentMid} />
                  </g>
                );
              }))}
            </svg>

            {tasks.map((t, i) => {
              const g = window.GROUPS[t.group];
              const startOff = window.dateUtils.dayOffset(t.start);
              const dur = window.dateUtils.duration(t.start, t.end);
              const barH = rowH > 38 ? 26 : rowH > 32 ? 22 : 18;
              return (
                <div key={t.id} style={{
                  display: 'flex', height: rowH, position: 'relative',
                  borderBottom: `1px solid ${BG.border}`,
                }}>
                  <div style={{
                    position: 'sticky', left: 0, zIndex: 2, width: labelW,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: `0 12px 0 ${14 + (t.parent ? 18 : 0)}px`,
                    borderRight: `1px solid ${BG.border}`,
                    background: BG.panel,
                  }}>
                    {t.milestone ? (
                      <BGIcon name="diamond" size={11} color={BG.accent} />
                    ) : (
                      <div style={{ width: 5, height: 18, borderRadius: 3,
                        background: `linear-gradient(180deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.18 ${g.hue}))`,
                        flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontSize: 12.5, color: BG.text,
                      fontWeight: !t.parent && !t.milestone ? 500 : 400,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{t.title}</span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    {t.milestone ? (
                      <div style={{
                        position: 'absolute', left: startOff * dayW + dayW / 2 - 9,
                        top: rowH / 2 - 9, width: 18, height: 18,
                        background: `linear-gradient(135deg, oklch(0.62 0.20 295), oklch(0.42 0.20 295))`,
                        transform: 'rotate(45deg)', borderRadius: 3,
                        boxShadow: '0 2px 6px oklch(0.45 0.18 295 / 0.3)',
                      }} />
                    ) : (
                      <div
                        onMouseDown={(e) => {
                          if (e.target.dataset.handle) return;
                          setDrag({ id: t.id, mode: 'move', startX: e.clientX, origStart: t.start, origEnd: t.end });
                        }}
                        style={{
                          position: 'absolute', left: startOff * dayW + 1,
                          top: (rowH - barH) / 2,
                          width: dur * dayW - 2, height: barH,
                          background: `linear-gradient(180deg, oklch(0.94 0.04 ${g.hue}), oklch(0.88 0.06 ${g.hue}))`,
                          borderRadius: barH / 2,
                          border: `1px solid oklch(0.78 0.08 ${g.hue})`,
                          cursor: 'grab', overflow: 'hidden',
                          boxShadow: drag?.id === t.id
                            ? `0 6px 16px oklch(0.50 0.16 ${g.hue} / 0.35)`
                            : '0 1px 2px rgba(40,30,55,0.06)',
                        }}>
                        <div style={{
                          height: '100%', width: `${t.progress}%`,
                          background: `linear-gradient(180deg, oklch(0.68 0.14 ${g.hue}), oklch(0.50 0.20 ${g.hue}))`,
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0, padding: '0 12px',
                          display: 'flex', alignItems: 'center',
                          fontSize: 11, fontWeight: 500,
                          color: t.progress > 50 ? '#fff' : `oklch(0.30 0.16 ${g.hue})`,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          letterSpacing: '0.01em',
                        }}>
                          {dur * dayW > 70 ? `${t.progress}% · ${t.hours}h` : `${t.progress}%`}
                        </div>
                        <div data-handle="l" onMouseDown={(e) => {
                          e.stopPropagation();
                          setDrag({ id: t.id, mode: 'resize-l', startX: e.clientX, origStart: t.start, origEnd: t.end });
                        }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, cursor: 'ew-resize' }} />
                        <div data-handle="r" onMouseDown={(e) => {
                          e.stopPropagation();
                          setDrag({ id: t.id, mode: 'resize-r', startX: e.clientX, origStart: t.start, origEnd: t.end });
                        }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, cursor: 'ew-resize' }} />
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

// ─── Network B — feature view, large clean nodes ──────────────
function NetworkViewB({ tasks }) {
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

  const nodeW = 200, nodeH = 96, gapX = 72, gapY = 22;
  const colX = (r) => 40 + r * (nodeW + gapX);
  const positions = {};
  for (let r = 0; r <= maxRank; r++) {
    (byRank[r] || []).forEach((t, i) => {
      positions[t.id] = { x: colX(r), y: 60 + i * (nodeH + gapY) };
    });
  }
  const totalW = colX(maxRank) + nodeW + 40;
  const totalH = Math.max(...Object.values(byRank).map(l => l.length)) * (nodeH + gapY) + 100;

  // Critical path: backwards from t12
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
    <div style={{ flex: 1, overflow: 'auto', background: BG.bg, padding: 24 }}>
      {/* legend / summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          padding: '10px 16px', borderRadius: 10,
          background: `linear-gradient(135deg, oklch(0.97 0.02 295), ${BG.panel})`,
          border: '1px solid oklch(0.90 0.04 295)',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.10em',
            color: BG.textFaint, textTransform: 'uppercase', fontFamily: BG.mono }}>
            Critical Path
          </div>
          <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: BG.text }}>
            {[...cpIds].length} ノード · {top.filter(t => cpIds.has(t.id) && !t.milestone).reduce((s, t) => s + t.hours, 0)}h
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: BG.textMuted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 3, borderRadius: 2,
              background: `linear-gradient(90deg, oklch(0.62 0.20 295), oklch(0.42 0.20 295))` }} />
            クリティカル
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 2, borderRadius: 1, background: BG.borderStrong }} />
            通常依存
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative', width: totalW, minHeight: totalH,
        background: BG.panel, borderRadius: 14, border: `1px solid ${BG.border}`,
        boxShadow: '0 1px 3px rgba(40,30,55,0.04)',
        backgroundImage: `radial-gradient(circle at 1px 1px, ${BG.border} 1px, transparent 0)`,
        backgroundSize: '20px 20px', backgroundPosition: '20px 20px',
      }}>
        {/* rank headers */}
        {Array.from({ length: maxRank + 1 }, (_, r) => (
          <div key={r} style={{
            position: 'absolute', left: colX(r), top: 18, width: nodeW,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.10em',
            color: BG.textFaint, textTransform: 'uppercase', fontFamily: BG.mono,
            textAlign: 'center',
          }}>STAGE {r + 1}</div>
        ))}

        <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="cpEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.62 0.20 295)" />
              <stop offset="100%" stopColor="oklch(0.42 0.20 295)" />
            </linearGradient>
          </defs>
          {top.map(t => t.deps.map(d => {
            const from = positions[d];
            const to = positions[t.id];
            if (!from || !to) return null;
            const x1 = from.x + nodeW, y1 = from.y + nodeH / 2;
            const x2 = to.x, y2 = to.y + nodeH / 2;
            const cp1x = x1 + 40, cp2x = x2 - 40;
            const isCP = cpIds.has(d) && cpIds.has(t.id);
            return (
              <g key={`${d}-${t.id}`}>
                <path d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2 - 6} ${y2}`}
                  stroke={isCP ? 'url(#cpEdge)' : BG.borderStrong}
                  strokeWidth={isCP ? 2.4 : 1.4} fill="none" />
                <path d={`M ${x2 - 7} ${y2 - 4} L ${x2} ${y2} L ${x2 - 7} ${y2 + 4} Z`}
                  fill={isCP ? 'oklch(0.42 0.20 295)' : BG.borderStrong} />
              </g>
            );
          }))}
        </svg>

        {top.map(t => {
          const p = positions[t.id];
          if (!p) return null;
          const g = window.GROUPS[t.group];
          const isCP = cpIds.has(t.id);
          const isMs = t.milestone;
          return (
            <div key={t.id} style={{
              position: 'absolute', left: p.x, top: p.y,
              width: nodeW, height: isMs ? 70 : nodeH,
              background: isMs ? `linear-gradient(135deg, oklch(0.96 0.04 ${g.hue}), ${BG.panel})` : BG.panel,
              border: `${isCP ? 2 : 1}px solid ${isCP ? BG.accent : BG.border}`,
              borderRadius: 12,
              boxShadow: isCP
                ? '0 4px 16px oklch(0.50 0.18 295 / 0.18)'
                : '0 1px 3px rgba(40,30,55,0.06)',
              padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6,
              fontFamily: BG.font,
              overflow: 'hidden',
            }}>
              {/* group strip */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                background: `linear-gradient(180deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.18 ${g.hue}))`,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
                {isMs && <BGIcon name="diamond" size={11} color={`oklch(0.55 0.18 ${g.hue})`} />}
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
                  color: `oklch(0.40 0.14 ${g.hue})`, textTransform: 'uppercase' }}>{g.en}</span>
                <span style={{ marginLeft: 'auto', fontFamily: BG.mono, fontSize: 9.5, color: BG.textFaint }}>
                  {t.id.toUpperCase()}
                </span>
              </div>
              <div style={{ paddingLeft: 6, fontSize: 12.5, fontWeight: 500, color: BG.text,
                lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                {t.title}
              </div>
              {!isMs && (
                <>
                  <div style={{ marginTop: 'auto', paddingLeft: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(40,30,55,0.06)', borderRadius: 2 }}>
                      <div style={{
                        width: `${t.progress}%`, height: '100%', borderRadius: 2,
                        background: t.progress === 100 ? BG.ok :
                          `linear-gradient(90deg, oklch(0.78 0.10 ${g.hue}), oklch(0.55 0.18 ${g.hue}))`,
                      }} />
                    </div>
                    <span style={{ fontFamily: BG.mono, fontSize: 10, color: BG.textMuted }}>{t.progress}%</span>
                  </div>
                  <div style={{ paddingLeft: 6, display: 'flex', justifyContent: 'space-between',
                    fontFamily: BG.mono, fontSize: 9.5, color: BG.textFaint }}>
                    <span>{window.dateUtils.fmt(t.start)} — {window.dateUtils.fmt(t.end)}</span>
                    <span>{t.hours}h</span>
                  </div>
                </>
              )}
              {isMs && (
                <div style={{ paddingLeft: 6, marginTop: 'auto', fontFamily: BG.mono, fontSize: 10, color: BG.textMuted }}>
                  {window.dateUtils.fmt(t.start)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.GanttViewB = GanttViewB;
window.NetworkViewB = NetworkViewB;
