// app-b.jsx — 案B "Aurora" — カードベース、余白豊か、視覚的
// パープルのグラデアクセント、上タブ、PERTを強調

const B = {
  bg: '#fbfaf8',
  panel: '#ffffff',
  panel2: '#f6f4f0',
  border: 'rgba(40,30,55,0.08)',
  borderStrong: 'rgba(40,30,55,0.16)',
  text: '#221d2c',
  textMuted: 'rgba(34,29,44,0.62)',
  textFaint: 'rgba(34,29,44,0.40)',
  accent: 'oklch(0.55 0.20 295)',
  accentSoft: 'oklch(0.96 0.03 295)',
  accentMid: 'oklch(0.78 0.12 295)',
  accentDeep: 'oklch(0.35 0.18 295)',
  ok: 'oklch(0.65 0.13 165)',
  warn: 'oklch(0.75 0.13 65)',
  danger: 'oklch(0.62 0.18 25)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
};

function IconB({ name, size = 16, color = 'currentColor' }) {
  const p = {
    list: <><path d="M4 5h12M4 10h12M4 15h12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></>,
    grid: <><rect x="3" y="3" width="6" height="6" rx="1.4" stroke={color} strokeWidth="1.3" fill="none"/><rect x="11" y="3" width="6" height="6" rx="1.4" stroke={color} strokeWidth="1.3" fill="none"/><rect x="3" y="11" width="6" height="6" rx="1.4" stroke={color} strokeWidth="1.3" fill="none"/><rect x="11" y="11" width="6" height="6" rx="1.4" stroke={color} strokeWidth="1.3" fill="none"/></>,
    gantt: <><rect x="3" y="4" width="7" height="2.6" rx="0.8" fill={color}/><rect x="6" y="8.7" width="9" height="2.6" rx="0.8" fill={color} opacity="0.55"/><rect x="4" y="13.4" width="11" height="2.6" rx="0.8" fill={color} opacity="0.35"/></>,
    network: <><circle cx="4" cy="4" r="1.8" fill={color}/><circle cx="16" cy="4" r="1.8" fill={color}/><circle cx="10" cy="10" r="1.8" fill={color}/><circle cx="4" cy="16" r="1.8" fill={color}/><circle cx="16" cy="16" r="1.8" fill={color}/><path d="M4 4 L10 10 L16 4 M10 10 L4 16 M10 10 L16 16" stroke={color} strokeWidth="0.9" fill="none"/></>,
    plus: <><path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></>,
    diamond: <><path d="M10 3 L17 10 L10 17 L3 10 Z" fill={color}/></>,
    check: <><path d="M4 10l4 4 8-8" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    arrow: <><path d="M5 10h10M11 6l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    chev: <><path d="M7 4l5 6-5 6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    chevD: <><path d="M4 7l6 5 6-5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    spark: <><path d="M3 13l4-5 3 3 4-6 3 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    clock: <><circle cx="10" cy="10" r="6.5" stroke={color} strokeWidth="1.3" fill="none"/><path d="M10 6v4l3 2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 20 20">{p[name]}</svg>;
}

// gradient progress ring
function ProgressRingB({ value, size = 64, stroke = 6, hue = 295, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  const id = `g${hue}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`oklch(0.78 0.12 ${hue})`} />
          <stop offset="100%" stopColor={`oklch(0.50 0.20 ${hue})`} />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(40,30,55,0.06)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r}
        stroke={`url(#${id})`} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle"
        fontSize={size * 0.30} fontWeight="600" fill={B.text} fontFamily={B.font}>
        {label != null ? label : `${value}%`}
      </text>
    </svg>
  );
}

// top tab bar (Aurora)
function TabBarB({ activeView, setView }) {
  const tabs = [
    { id: 'list', label: 'リスト', en: 'List', icon: 'list' },
    { id: 'dash', label: 'ダッシュボード', en: 'Dashboard', icon: 'grid' },
    { id: 'gantt', label: 'ガント', en: 'Gantt', icon: 'gantt' },
    { id: 'network', label: 'PERT', en: 'Network', icon: 'network' },
  ];
  return (
    <div style={{
      padding: '20px 28px 0',
      display: 'flex', flexDirection: 'column', gap: 16,
      background: B.bg,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em',
            color: B.textFaint, textTransform: 'uppercase', fontFamily: B.mono, marginBottom: 4 }}>
            PERSONAL · Q2 2026
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: B.text,
              letterSpacing: '-0.01em', fontFamily: B.font }}>
              パーソナル プロジェクト
            </h1>
            <span style={{ fontSize: 12, color: B.textMuted, fontFamily: B.mono }}>
              Apr 20 — Jun 28
            </span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 7,
            border: `1px solid ${B.border}`, background: B.panel,
            fontSize: 12, color: B.textMuted, cursor: 'default' }}>
            <IconB name="clock" size={13} color={B.textMuted} />
            64日 残り
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 7,
            background: `linear-gradient(135deg, oklch(0.62 0.20 295), oklch(0.45 0.20 295))`,
            color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'default',
            boxShadow: '0 2px 8px oklch(0.45 0.18 295 / 0.25)' }}>
            <IconB name="plus" size={12} color="#fff" />
            新規タスク
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${B.border}` }}>
        {tabs.map(tab => {
          const active = tab.id === activeView;
          return (
            <div key={tab.id} onClick={() => setView(tab.id)}
              style={{
                position: 'relative',
                padding: '10px 16px 12px', display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? B.accentDeep : B.textMuted,
                cursor: 'default',
              }}>
              <IconB name={tab.icon} size={14} color={active ? B.accent : B.textMuted} />
              <span>{tab.label}</span>
              <span style={{ fontSize: 10, fontFamily: B.mono, opacity: 0.7 }}>{tab.en}</span>
              {active && <div style={{
                position: 'absolute', left: 8, right: 8, bottom: -1, height: 2,
                background: B.accent, borderRadius: '2px 2px 0 0',
              }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.B_TOKENS = B;
window.IconB = IconB;
window.ProgressRingB = ProgressRingB;
window.TabBarB = TabBarB;
