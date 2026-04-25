// app-a-gantt.jsx — 案A: Gantt + PERT Network views

const { A_TOKENS: GT, IconA: GIcon } = window;

// ─── Gantt View ───────────────────────────────────────────────
function GanttViewA({ tasks, density, onTaskUpdate }) {
  const labelW = 220;
  const dayW = density === 'compact' ? 14 : density === 'comfy' ? 22 : 18;
  const rowH = density === 'compact' ? 26 : density === 'comfy' ? 36 : 30;
  const total = window.dateUtils.totalDays;
  const todayOff = window.dateUtils.todayOffset();

  const [drag, setDrag] = React.useState(null);
  // drag = { id, mode: 'move' | 'resize-l' | 'resize-r', startX, origStart, origEnd }
  const containerRef = React.useRef(null);

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

  // build month/week headers
  const months = [];
  let cur = new Date(window.dateUtils.PROJECT_START);
  while (cur <= window.dateUtils.PROJECT_END) {
    const monStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const fromOff = Math.max(0, Math.round((monStart - window.dateUtils.PROJECT_START) / 86400000));
    const toOff = Math.min(total, Math.round((monEnd - window.dateUtils.PROJECT_START) / 86400000) + 1);
    months.push({ label: `${monStart.getFullYear()}年${monStart.getMonth() + 1}月`, from: fromOff, days: toOff - fromOff });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const weekTicks = [];
  for (let d = 0; d <= total; d++) {
    const dt = new Date(window.dateUtils.PROJECT_START);
    dt.setDate(dt.getDate() + d);
    if (dt.getDay() === 1) weekTicks.push({ off: d, label: `${dt.getMonth() + 1}/${dt.getDate()}` });
  }

  const visibleTasks = tasks; // include all in order
  const totalWidth = labelW + total * dayW;

  // map task id → row index for dep arrows
  const rowIndex = {};
  visibleTasks.forEach((t, i) => rowIndex[t.id] = i);

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'auto', background: GT.panel, position: 'relative' }}>
      <div style={{ width: totalWidth, position: 'relative' }}>
        {/* sticky header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 3, background: GT.panel,
          borderBottom: `1px solid ${GT.borderStrong}` }}>
          {/* months row */}
          <div style={{ display: 'flex', height: 22, paddingLeft: labelW,
            borderBottom: `1px solid ${GT.border}` }}>
            {months.map((m, i) => (
              <div key={i} style={{
                width: m.days * dayW, fontSize: 10.5, fontWeight: 600, color: GT.text,
                padding: '4px 8px', borderLeft: i > 0 ? `1px solid ${GT.border}` : 'none',
                background: i % 2 === 0 ? GT.panel : GT.panel2,
                fontFamily: GT.font,
              }}>{m.label}</div>
            ))}
          </div>
          {/* days row */}
          <div style={{ display: 'flex', height: 20, paddingLeft: labelW, position: 'relative' }}>
            {weekTicks.map((w, i) => (
              <div key={i} style={{
                position: 'absolute', left: labelW + w.off * dayW,
                fontSize: 9.5, color: GT.textFaint, fontFamily: GT.mono, padding: '4px 0 0 3px',
              }}>{w.label}</div>
            ))}
          </div>
          {/* task header label */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: labelW, height: 42,
            display: 'flex', alignItems: 'center', padding: '0 14px',
            borderRight: `1px solid ${GT.borderStrong}`, background: GT.panel,
            fontSize: 10.5, fontWeight: 600, color: GT.textMuted, letterSpacing: '0.04em',
            textTransform: 'uppercase' }}>
            タスク
          </div>
        </div>

        {/* body */}
        <div style={{ position: 'relative' }}>
          {/* weekend stripes & today line — full svg overlay on bars area */}
          <svg style={{ position: 'absolute', left: labelW, top: 0,
            width: total * dayW, height: visibleTasks.length * rowH, pointerEvents: 'none' }}>
            {/* weekend bg */}
            {Array.from({ length: total + 1 }, (_, d) => {
              const dt = new Date(window.dateUtils.PROJECT_START);
              dt.setDate(dt.getDate() + d);
              if (dt.getDay() === 0 || dt.getDay() === 6) {
                return <rect key={d} x={d * dayW} y={0} width={dayW} height="100%"
                  fill="rgba(20,15,30,0.025)" />;
              }
              return null;
            })}
            {/* week grid */}
            {weekTicks.map((w, i) => (
              <line key={i} x1={w.off * dayW} x2={w.off * dayW} y1={0} y2={visibleTasks.length * rowH}
                stroke={GT.border} strokeWidth="1" />
            ))}
            {/* today line */}
            <line x1={todayOff * dayW + dayW / 2} x2={todayOff * dayW + dayW / 2}
              y1={0} y2={visibleTasks.length * rowH} stroke={GT.accent} strokeWidth="1.5" />
            <rect x={todayOff * dayW + dayW / 2 - 12} y={0} width={24} height={14}
              fill={GT.accent} />
            <text x={todayOff * dayW + dayW / 2} y={10} textAnchor="middle"
              fontSize="9" fill="#fff" fontFamily={GT.mono}>TODAY</text>

            {/* dependency arrows */}
            {visibleTasks.map((t) => t.deps.map(depId => {
              const dep = tasks.find(x => x.id === depId);
              if (!dep) return null;
              const fromX = (window.dateUtils.dayOffset(dep.end) + 1) * dayW;
              const fromY = rowIndex[depId] * rowH + rowH / 2;
              const toX = window.dateUtils.dayOffset(t.start) * dayW;
              const toY = rowIndex[t.id] * rowH + rowH / 2;
              const midX = Math.max(fromX + 6, toX - 6);
              const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX - 4} ${toY}`;
              return (
                <g key={`${depId}-${t.id}`}>
                  <path d={path} stroke={GT.accentMid} strokeWidth="1" fill="none" />
                  <path d={`M ${toX - 4} ${toY - 2.5} L ${toX} ${toY} L ${toX - 4} ${toY + 2.5} Z`} fill={GT.accentMid} />
                </g>
              );
            }))}
          </svg>

          {/* rows */}
          {visibleTasks.map((t, i) => {
            const g = window.GROUPS[t.group];
            const startOff = window.dateUtils.dayOffset(t.start);
            const dur = window.dateUtils.duration(t.start, t.end);
            const barColor = `oklch(0.65 0.14 ${g.hue})`;
            const barColorL = `oklch(0.85 0.08 ${g.hue})`;
            return (
              <div key={t.id} style={{
                display: 'flex', height: rowH, position: 'relative',
                borderBottom: `1px solid ${GT.border}`,
              }}>
                {/* label */}
                <div style={{
                  position: 'sticky', left: 0, zIndex: 2, width: labelW,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: `0 8px 0 ${10 + (t.parent ? 16 : 0)}px`,
                  borderRight: `1px solid ${GT.border}`,
                  background: GT.panel, fontSize: 11.5, color: GT.text,
                  overflow: 'hidden',
                }}>
                  {t.milestone ? (
                    <GIcon name="diamond" size={9} color={GT.accent} />
                  ) : (
                    <div style={{ width: 4, height: 14, borderRadius: 2, background: barColor, flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontWeight: !t.parent && !t.milestone ? 500 : 400 }}>{t.title}</span>
                </div>
                {/* bar area */}
                <div style={{ flex: 1, position: 'relative' }}>
                  {t.milestone ? (
                    <div style={{
                      position: 'absolute', left: startOff * dayW + dayW / 2 - 7,
                      top: rowH / 2 - 7, width: 14, height: 14,
                      background: GT.accent, transform: 'rotate(45deg)',
                      borderRadius: 2,
                    }} />
                  ) : (
                    <div
                      onMouseDown={(e) => {
                        if (e.target.dataset.handle) return;
                        setDrag({ id: t.id, mode: 'move', startX: e.clientX, origStart: t.start, origEnd: t.end });
                      }}
                      style={{
                        position: 'absolute', left: startOff * dayW + 1,
                        top: (rowH - (rowH > 32 ? 22 : 18)) / 2,
                        width: dur * dayW - 2, height: rowH > 32 ? 22 : 18,
                        background: barColorL, borderRadius: 4,
                        cursor: 'grab', overflow: 'hidden',
                        boxShadow: drag?.id === t.id ? `0 4px 12px oklch(0.50 0.14 ${g.hue} / 0.3)` : 'none',
                      }}>
                      {/* progress fill */}
                      <div style={{
                        height: '100%', width: `${t.progress}%`,
                        background: barColor,
                        borderRadius: '4px 0 0 4px',
                      }} />
                      {/* label inside */}
                      <div style={{
                        position: 'absolute', inset: 0, padding: '0 8px',
                        display: 'flex', alignItems: 'center',
                        fontSize: 10.5, color: t.progress > 50 ? '#fff' : GT.text,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        textShadow: t.progress > 50 ? '0 0 2px rgba(0,0,0,0.2)' : 'none',
                      }}>
                        {dur * dayW > 60 ? `${t.progress}% · ${t.hours}h` : `${t.progress}%`}
                      </div>
                      {/* handles */}
                      <div data-handle="l" onMouseDown={(e) => {
                        e.stopPropagation();
                        setDrag({ id: t.id, mode: 'resize-l', startX: e.clientX, origStart: t.start, origEnd: t.end });
                      }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, cursor: 'ew-resize' }} />
                      <div data-handle="r" onMouseDown={(e) => {
                        e.stopPropagation();
                        setDrag({ id: t.id, mode: 'resize-r', startX: e.clientX, origStart: t.start, origEnd: t.end });
                      }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, cursor: 'ew-resize' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PERT Network View ────────────────────────────────────────
function NetworkViewA({ tasks }) {
  // Layout tasks as a DAG: rank = longest path from any root
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
  top.forEach(t => {
    const r = ranks[t.id];
    (byRank[r] = byRank[r] || []).push(t);
  });
  const maxRank = Math.max(...Object.keys(byRank).map(Number));

  const nodeW = 168, nodeH = 78, gapX = 56, gapY = 16;
  const colX = (r) => 32 + r * (nodeW + gapX);
  const positions = {};
  for (let r = 0; r <= maxRank; r++) {
    const list = byRank[r] || [];
    list.forEach((t, i) => {
      positions[t.id] = { x: colX(r), y: 32 + i * (nodeH + gapY) };
    });
  }
  const totalW = colX(maxRank) + nodeW + 32;
  const totalH = Math.max(...Object.values(byRank).map(l => l.length)) * (nodeH + gapY) + 64;

  // Critical path: walk forward picking longest by hours, terminating at last milestone
  const cpIds = (() => {
    const finishMs = top.find(t => t.id === 't12');
    if (!finishMs) return new Set();
    // walk back through deps choosing the predecessor with max(rank)
    const cp = new Set();
    const stack = [finishMs.id];
    while (stack.length) {
      const id = stack.pop();
      cp.add(id);
      const t = top.find(x => x.id === id);
      if (!t) continue;
      // pick all deps with high priority — simpler: include all on critical chain
      t.deps.forEach(d => stack.push(d));
    }
    return cp;
  })();

  return (
    <div style={{ flex: 1, overflow: 'auto', background: GT.panel2, padding: 20 }}>
      <div style={{
        position: 'relative', width: totalW, minHeight: totalH,
        background: GT.panel, borderRadius: 10, border: `1px solid ${GT.border}`,
      }}>
        {/* legend */}
        <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 14,
          fontSize: 10.5, color: GT.textMuted, fontFamily: GT.font }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 3, background: GT.accent, borderRadius: 1 }} />
            クリティカルパス
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 3, background: GT.borderStrong, borderRadius: 1 }} />
            通常依存
          </div>
        </div>

        {/* edges */}
        <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {top.map(t => t.deps.map(d => {
            const from = positions[d];
            const to = positions[t.id];
            if (!from || !to) return null;
            const x1 = from.x + nodeW, y1 = from.y + nodeH / 2;
            const x2 = to.x, y2 = to.y + nodeH / 2;
            const cp1x = x1 + 30, cp2x = x2 - 30;
            const isCP = cpIds.has(d) && cpIds.has(t.id);
            return (
              <g key={`${d}-${t.id}`}>
                <path d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2 - 4} ${y2}`}
                  stroke={isCP ? GT.accent : GT.borderStrong}
                  strokeWidth={isCP ? 2 : 1.2} fill="none" />
                <path d={`M ${x2 - 5} ${y2 - 3} L ${x2} ${y2} L ${x2 - 5} ${y2 + 3} Z`}
                  fill={isCP ? GT.accent : GT.borderStrong} />
              </g>
            );
          }))}
        </svg>

        {/* nodes */}
        {top.map(t => {
          const p = positions[t.id];
          if (!p) return null;
          const g = window.GROUPS[t.group];
          const isCP = cpIds.has(t.id);
          const isMs = t.milestone;
          return (
            <div key={t.id} style={{
              position: 'absolute', left: p.x, top: p.y,
              width: nodeW, height: isMs ? 56 : nodeH,
              background: isMs ? `oklch(0.96 0.04 ${g.hue})` : GT.panel,
              border: `${isCP ? 1.5 : 1}px solid ${isCP ? GT.accent : GT.border}`,
              borderRadius: 8,
              boxShadow: isCP ? `0 2px 8px oklch(0.50 0.18 295 / 0.15)` : '0 1px 2px rgba(0,0,0,0.04)',
              padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4,
              fontFamily: GT.font,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {isMs && <GIcon name="diamond" size={9} color={`oklch(0.55 0.18 ${g.hue})`} />}
                <span style={{ fontSize: 9, fontWeight: 600, color: `oklch(0.45 0.14 ${g.hue})`,
                  letterSpacing: '0.04em', textTransform: 'uppercase' }}>{g.en}</span>
                <span style={{ marginLeft: 'auto', fontFamily: GT.mono, fontSize: 9, color: GT.textFaint }}>
                  {t.id.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: GT.text, lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{t.title}</div>
              {!isMs && (
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 3, background: 'rgba(20,15,30,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${t.progress}%`, height: '100%',
                      background: t.progress === 100 ? GT.ok : GT.accent, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: GT.mono, fontSize: 9.5, color: GT.textMuted }}>{t.progress}%</span>
                </div>
              )}
              {!isMs && (
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontFamily: GT.mono, fontSize: 9.5, color: GT.textFaint }}>
                  <span>{window.dateUtils.fmt(t.start)} – {window.dateUtils.fmt(t.end)}</span>
                  <span>{t.hours}h</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.GanttViewA = GanttViewA;
window.NetworkViewA = NetworkViewA;
