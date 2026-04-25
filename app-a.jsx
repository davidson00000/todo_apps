// app-a.jsx — 案A "Studio" — 編集者風UI、密度高め、機能的
// プロフェッショナルミニマル・パープル系・サイドバー＋3ビュー切り替え

const A = {
  bg: '#fafaf9',
  panel: '#ffffff',
  panel2: '#f4f3f1',
  border: 'rgba(20,15,30,0.08)',
  borderStrong: 'rgba(20,15,30,0.14)',
  text: '#1a1820',
  textMuted: 'rgba(26,24,32,0.58)',
  textFaint: 'rgba(26,24,32,0.38)',
  accent: 'oklch(0.52 0.18 295)',
  accentSoft: 'oklch(0.95 0.04 295)',
  accentMid: 'oklch(0.78 0.10 295)',
  accentDark: 'oklch(0.38 0.18 295)',
  ok: 'oklch(0.62 0.13 165)',
  warn: 'oklch(0.72 0.13 65)',
  danger: 'oklch(0.60 0.18 25)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
};

// ─── small primitives ─────────────────────────────────────────
function ChipA({ children, hue, filled, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 4,
      fontSize: 10.5, fontWeight: 500, lineHeight: 1.3,
      letterSpacing: '0.01em',
      background: filled ? `oklch(0.94 0.04 ${hue})` : 'transparent',
      color: `oklch(0.40 0.14 ${hue})`,
      border: filled ? 'none' : `0.5px solid oklch(0.85 0.06 ${hue})`,
      ...style,
    }}>{children}</span>
  );
}

function ProgressBarA({ value, w = 80, h = 4 }) {
  return (
    <div style={{
      width: w, height: h, background: 'rgba(20,15,30,0.06)',
      borderRadius: h, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        width: `${value}%`, height: '100%',
        background: value === 100 ? A.ok : A.accent,
        borderRadius: h,
        transition: 'width .3s',
      }} />
    </div>
  );
}

function IconA({ name, size = 14, color = 'currentColor' }) {
  const paths = {
    list: <><path d="M3 4h10M3 8h10M3 12h10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></>,
    grid: <><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" stroke={color} strokeWidth="1.2" fill="none"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" stroke={color} strokeWidth="1.2" fill="none"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" stroke={color} strokeWidth="1.2" fill="none"/><rect x="9" y="9" width="4.5" height="4.5" rx="1" stroke={color} strokeWidth="1.2" fill="none"/></>,
    gantt: <><rect x="2" y="3" width="6" height="2.2" rx="0.6" fill={color}/><rect x="5" y="6.6" width="7" height="2.2" rx="0.6" fill={color} opacity="0.6"/><rect x="3" y="10.2" width="9" height="2.2" rx="0.6" fill={color} opacity="0.4"/></>,
    network: <><circle cx="3" cy="3" r="1.6" fill={color}/><circle cx="13" cy="3" r="1.6" fill={color}/><circle cx="8" cy="8" r="1.6" fill={color}/><circle cx="3" cy="13" r="1.6" fill={color}/><circle cx="13" cy="13" r="1.6" fill={color}/><path d="M3 3 L8 8 L13 3 M8 8 L3 13 M8 8 L13 13" stroke={color} strokeWidth="0.8" fill="none"/></>,
    plus: <><path d="M8 3v10M3 8h10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></>,
    chev: <><path d="M5 3l4 5-4 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    chevD: <><path d="M3 5l5 4 5-4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    flag: <><path d="M3 2v12M3 3h7l-1.5 2L10 7H3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    check: <><path d="M3 8l3 3 7-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    diamond: <><path d="M8 2 L14 8 L8 14 L2 8 Z" fill={color}/></>,
    search: <><circle cx="7" cy="7" r="4" stroke={color} strokeWidth="1.2" fill="none"/><path d="M10 10l3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></>,
    filter: <><path d="M2 3h12L9 9v4l-2 1V9z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none"/></>,
    dot: <circle cx="8" cy="8" r="2" fill={color}/>,
  };
  return <svg width={size} height={size} viewBox="0 0 16 16">{paths[name]}</svg>;
}

// ─── Sidebar ──────────────────────────────────────────────────
function SidebarA({ activeView, setView, density, showSidebar }) {
  if (!showSidebar) return null;
  const w = 220;
  const padBlock = density === 'compact' ? 4 : density === 'comfy' ? 8 : 6;
  const navItems = [
    { id: 'list', label: 'リスト', en: 'List', icon: 'list' },
    { id: 'dash', label: 'ダッシュボード', en: 'Dashboard', icon: 'grid' },
    { id: 'gantt', label: 'ガント', en: 'Gantt', icon: 'gantt' },
    { id: 'network', label: 'PERT', en: 'Network', icon: 'network' },
  ];
  return (
    <div style={{
      width: w, flexShrink: 0, borderRight: `1px solid ${A.border}`,
      background: A.panel2, display: 'flex', flexDirection: 'column',
      fontFamily: A.font,
    }}>
      {/* project header */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
          color: A.textFaint, textTransform: 'uppercase' }}>Project</div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: A.text }}>
          パーソナル Q2
        </div>
        <div style={{ marginTop: 2, fontSize: 11, color: A.textMuted, fontFamily: A.mono }}>
          Apr 20 — Jun 28 · 2026
        </div>
      </div>

      <div style={{ height: 1, background: A.border, margin: '4px 0' }} />

      {/* nav */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
          color: A.textFaint, textTransform: 'uppercase', padding: '6px 6px' }}>Views</div>
        {navItems.map(it => {
          const active = it.id === activeView;
          return (
            <div
              key={it.id} onClick={() => setView(it.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: `${padBlock}px 8px`, borderRadius: 6, cursor: 'default',
                background: active ? A.accent : 'transparent',
                color: active ? '#fff' : A.text,
                fontSize: 12.5, fontWeight: active ? 500 : 400,
                marginBottom: 1,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(20,15,30,0.04)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <IconA name={it.icon} size={13} color={active ? '#fff' : A.textMuted} />
              <span>{it.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6, fontFamily: A.mono }}>{it.en}</span>
            </div>
          );
        })}
      </div>

      <div style={{ height: 1, background: A.border, margin: '4px 0' }} />

      {/* groups */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
          color: A.textFaint, textTransform: 'uppercase', padding: '6px 6px' }}>Groups</div>
        {Object.entries(window.GROUPS).map(([k, g]) => (
          <div key={k} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: `${padBlock}px 8px`, borderRadius: 6, fontSize: 12, color: A.text,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2,
              background: `oklch(0.65 0.14 ${g.hue})` }} />
            <span>{g.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: A.textFaint, fontFamily: A.mono }}>
              {window.SAMPLE_TASKS.filter(t => t.group === k && !t.milestone).length}
            </span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* footer */}
      <div style={{
        padding: '10px 14px', fontSize: 10.5, color: A.textFaint,
        borderTop: `1px solid ${A.border}`, fontFamily: A.mono,
      }}>
        v0.3 · synced 2m ago
      </div>
    </div>
  );
}

window.SidebarA = SidebarA;
window.ChipA = ChipA;
window.ProgressBarA = ProgressBarA;
window.IconA = IconA;
window.A_TOKENS = A;
