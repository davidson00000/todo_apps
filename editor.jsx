// editor.jsx — Full CRUD: project switcher, task editor modal, add/delete.
// Exports: window.useAppState, window.ProjectSwitcher, window.TaskEditor,
// window.AddTaskButton, window.ConfirmDialog, window.useConfirm

const E_ACCENT = 'oklch(0.55 0.18 295)';
const E_ACCENT_DARK = 'oklch(0.45 0.20 295)';
const E_DANGER = 'oklch(0.55 0.20 25)';
const E_TEXT = '#1a1820';
const E_TEXT_MUTED = '#6b6478';
const E_TEXT_FAINT = '#9b94a8';
const E_BG = '#fafaf7';
const E_BORDER = 'rgba(20,15,30,0.10)';
const E_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';
const E_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// ─── Global app-state hook ─────────────────────────────────────
function useAppState() {
  const [state, setStateRaw] = React.useState(() => window.makeInitialState());
  const [loaded, setLoaded] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState('loading');

  // initial load
  React.useEffect(() => {
    if (!window.AppSync.hasKey) {
      setSyncStatus('no-key');
      setLoaded(true);
      return;
    }
    (async () => {
      const r = await window.AppSync.loadInitial();
      const normalized = window.normalizeState(r.state);
      setStateRaw(normalized);
      setSyncStatus(r.source === 'remote' ? 'synced' : (r.source === 'local' ? 'offline' : 'synced'));
      setLoaded(true);
    })();
    window.AppSync.listen((kind) => {
      if (kind === 'synced') setSyncStatus('synced');
      else if (kind === 'offline') setSyncStatus('offline');
    });
  }, []);

  // wrapped setter that persists
  const setState = React.useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (loaded && window.AppSync.hasKey) {
        setSyncStatus('saving');
        window.AppSync.queuePush(next);
      }
      return next;
    });
  }, [loaded]);

  // helpers
  const activeProject = state.projects[state.activeProjectId];
  const tasks = state.tasksByProject[state.activeProjectId] || [];

  const setTasks = React.useCallback((updater) => {
    setState(prev => {
      const cur = prev.tasksByProject[prev.activeProjectId] || [];
      const next = typeof updater === 'function' ? updater(cur) : updater;
      return {
        ...prev,
        tasksByProject: { ...prev.tasksByProject, [prev.activeProjectId]: next },
      };
    });
  }, [setState]);

  const updateTask = React.useCallback((id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  }, [setTasks]);

  const addTask = React.useCallback((task) => {
    setTasks(ts => [...ts, { ...task, id: task.id || window.genId('t') }]);
  }, [setTasks]);

  const deleteTask = React.useCallback((id) => {
    setTasks(ts => ts.filter(t => t.id !== id && t.parent !== id)
      .map(t => ({ ...t, deps: (t.deps || []).filter(d => d !== id) })));
  }, [setTasks]);

  const setActiveProject = React.useCallback((pid) => {
    setState(prev => ({ ...prev, activeProjectId: pid }));
  }, [setState]);

  const createProject = React.useCallback((name) => {
    const id = 'p_' + Math.random().toString(36).slice(2, 9);
    setState(prev => {
      const usedHues = Object.values(prev.projects).map(p => p.hue);
      const hue = window.PROJECT_HUES.find(h => !usedHues.includes(h)) || window.PROJECT_HUES[Object.keys(prev.projects).length % window.PROJECT_HUES.length];
      return {
        ...prev,
        projects: { ...prev.projects, [id]: { id, name: name || '無題のプロジェクト', hue, createdAt: Date.now() } },
        projectOrder: [...prev.projectOrder, id],
        activeProjectId: id,
        tasksByProject: { ...prev.tasksByProject, [id]: [] },
      };
    });
    return id;
  }, [setState]);

  const renameProject = React.useCallback((pid, name) => {
    setState(prev => ({
      ...prev,
      projects: { ...prev.projects, [pid]: { ...prev.projects[pid], name } },
    }));
  }, [setState]);

  const deleteProject = React.useCallback((pid) => {
    setState(prev => {
      const newProjects = { ...prev.projects }; delete newProjects[pid];
      const newTasks = { ...prev.tasksByProject }; delete newTasks[pid];
      const newOrder = prev.projectOrder.filter(x => x !== pid);
      let active = prev.activeProjectId;
      if (active === pid) {
        active = newOrder[0];
      }
      // if we deleted the last project, create a fresh empty one
      if (newOrder.length === 0) {
        const fresh = window.makeInitialState();
        return fresh;
      }
      return { ...prev, projects: newProjects, projectOrder: newOrder, activeProjectId: active, tasksByProject: newTasks };
    });
  }, [setState]);

  return {
    state, setState, loaded, syncStatus,
    activeProject, tasks, setTasks,
    updateTask, addTask, deleteTask,
    setActiveProject, createProject, renameProject, deleteProject,
  };
}

// ─── Confirm dialog ────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = '削除', cancelLabel = 'キャンセル', danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(20,15,30,0.40)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: 24,
        maxWidth: 380, width: '100%',
        boxShadow: '0 20px 60px rgba(20,15,30,0.20)',
        fontFamily: E_FONT,
      }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: E_TEXT }}>{title}</h3>
        <p style={{ margin: '8px 0 20px', fontSize: 13, color: E_TEXT_MUTED, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnStyle({ ghost: true })}>{cancelLabel}</button>
          <button onClick={onConfirm} style={btnStyle({ danger })}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function useConfirm() {
  const [cfg, setCfg] = React.useState(null);
  const ask = (opts) => new Promise((resolve) => {
    setCfg({
      ...opts,
      onConfirm: () => { setCfg(null); resolve(true); },
      onCancel: () => { setCfg(null); resolve(false); },
    });
  });
  const node = <ConfirmDialog open={!!cfg} {...(cfg || {})} />;
  return [ask, node];
}

function btnStyle({ ghost, danger, accent }) {
  if (danger) {
    return {
      padding: '8px 14px', borderRadius: 8, border: 'none',
      background: E_DANGER, color: '#fff', fontWeight: 600, fontSize: 13,
      fontFamily: E_FONT, cursor: 'pointer',
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', borderRadius: 8,
      border: `1px solid ${E_BORDER}`, background: '#fff', color: E_TEXT,
      fontWeight: 500, fontSize: 13, fontFamily: E_FONT, cursor: 'pointer',
    };
  }
  return {
    padding: '8px 14px', borderRadius: 8, border: 'none',
    background: accent || E_ACCENT, color: '#fff', fontWeight: 600, fontSize: 13,
    fontFamily: E_FONT, cursor: 'pointer',
  };
}

// ─── Project switcher ──────────────────────────────────────────
function ProjectSwitcher({ state, setActiveProject, createProject, renameProject, deleteProject, askConfirm }) {
  const [open, setOpen] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState('');

  const active = state.projects[state.activeProjectId];
  const list = state.projectOrder.map(id => state.projects[id]).filter(Boolean);

  const onCreate = () => {
    const name = window.prompt('新規プロジェクト名', '');
    if (name && name.trim()) {
      createProject(name.trim());
      setOpen(false);
    }
  };

  const onDelete = async (p) => {
    const ok = await askConfirm({
      title: 'プロジェクトを削除',
      message: `「${p.name}」とすべてのタスクが削除されます。この操作は取り消せません。`,
      confirmLabel: '削除する',
    });
    if (ok) deleteProject(p.id);
  };

  const startRename = (p) => {
    setRenamingId(p.id);
    setRenameVal(p.name);
  };
  const finishRename = () => {
    if (renamingId && renameVal.trim()) renameProject(renamingId, renameVal.trim());
    setRenamingId(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 8,
        border: `1px solid ${E_BORDER}`, background: '#fff',
        fontFamily: E_FONT, fontSize: 13, fontWeight: 500, color: E_TEXT,
        cursor: 'pointer', minWidth: 0, maxWidth: 240,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
          background: `oklch(0.60 0.16 ${active?.hue ?? 295})` }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {active?.name || '—'}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0, opacity: 0.5 }}>
          <path d="M2 4l3 3 3-3" stroke={E_TEXT} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => { setOpen(false); setRenamingId(null); }} style={{
            position: 'fixed', inset: 0, zIndex: 100,
          }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 101,
            background: '#fff', borderRadius: 10, minWidth: 260,
            boxShadow: '0 8px 24px rgba(20,15,30,0.15)',
            border: `1px solid ${E_BORDER}`,
            padding: 4, fontFamily: E_FONT,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: E_TEXT_FAINT,
              padding: '8px 10px 6px', letterSpacing: '0.06em' }}>
              PROJECTS · {list.length}
            </div>
            {list.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: p.id === state.activeProjectId ? 'rgba(20,15,30,0.04)' : 'transparent',
                cursor: 'pointer',
              }}
                onClick={() => {
                  if (renamingId === p.id) return;
                  setActiveProject(p.id);
                  setOpen(false);
                }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                  background: `oklch(0.60 0.16 ${p.hue})` }} />
                {renamingId === p.id ? (
                  <input value={renameVal}
                    autoFocus
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') setRenamingId(null); }}
                    style={{
                      flex: 1, fontSize: 13, padding: '4px 6px', minWidth: 0,
                      border: `1px solid ${E_ACCENT}`, borderRadius: 4, fontFamily: E_FONT,
                      outline: 'none',
                    }} />
                ) : (
                  <span style={{ flex: 1, fontSize: 13, color: E_TEXT,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                )}
                <span style={{ fontFamily: E_MONO, fontSize: 10, color: E_TEXT_FAINT }}>
                  {(state.tasksByProject[p.id] || []).length}
                </span>
                <button onClick={(e) => { e.stopPropagation(); startRename(p); }}
                  title="名前変更"
                  style={{ width: 22, height: 22, padding: 0,
                    border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M8.5 1.5l2 2L4 10H2v-2l6.5-6.5z" fill="none" stroke={E_TEXT} strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(p); }}
                  title="削除"
                  style={{ width: 22, height: 22, padding: 0,
                    border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M3 4v6h6V4M2 3h8M5 3V2h2v1" stroke={E_TEXT} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
            <div style={{ height: 1, background: E_BORDER, margin: '4px 0' }} />
            <div onClick={onCreate} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
              color: E_ACCENT, fontWeight: 600, fontSize: 13,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 2v10M2 7h10" stroke={E_ACCENT} strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              新規プロジェクト
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Task editor modal ─────────────────────────────────────────
function TaskEditor({ open, task, allTasks, onSave, onDelete, onClose, isMobile }) {
  const [draft, setDraft] = React.useState(task);
  React.useEffect(() => { if (open) setDraft(task); }, [open, task]);

  if (!open || !draft) return null;

  const isNew = !allTasks.find(t => t.id === draft.id);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const eligibleParents = allTasks.filter(t => t.id !== draft.id && !t.milestone && t.parent !== draft.id);
  const eligibleDeps = allTasks.filter(t => t.id !== draft.id);

  const save = () => {
    if (!draft.title || !draft.title.trim()) return alert('タイトルを入力してください');
    if (new Date(draft.end) < new Date(draft.start)) return alert('期限は開始日以降にしてください');
    const final = {
      ...draft,
      title: draft.title.trim(),
      progress: draft.milestone ? (draft.progress === 100 ? 100 : 0) : Math.max(0, Math.min(100, draft.progress|0)),
      hours: draft.milestone ? 0 : Math.max(0, Number(draft.hours) || 0),
      end: draft.milestone ? draft.start : draft.end,
    };
    onSave(final);
  };

  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: E_TEXT_MUTED,
                letterSpacing: '0.04em', marginBottom: 6, textTransform: 'uppercase' };
  const fld = {
    width: '100%', padding: '9px 11px', fontSize: 14, fontFamily: E_FONT,
    border: `1px solid ${E_BORDER}`, borderRadius: 8, background: E_BG, color: E_TEXT,
    outline: 'none', boxSizing: 'border-box',
  };

  const toggleDep = (depId) => {
    set('deps', (draft.deps || []).includes(depId)
      ? draft.deps.filter(d => d !== depId)
      : [...(draft.deps || []), depId]);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 4000,
      background: 'rgba(20,15,30,0.40)', backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center', padding: isMobile ? 0 : 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: isMobile ? '16px 16px 0 0' : 16,
        width: '100%', maxWidth: 540,
        maxHeight: isMobile ? '92vh' : '88vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: E_FONT,
        boxShadow: '0 20px 60px rgba(20,15,30,0.25)',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: `1px solid ${E_BORDER}`,
        }}>
          <h3 style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 600, color: E_TEXT }}>
            {isNew ? (draft.milestone ? '新規マイルストーン' : '新規タスク') : (draft.milestone ? 'マイルストーンを編集' : 'タスクを編集')}
          </h3>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, padding: 0,
            border: 'none', background: 'rgba(20,15,30,0.05)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12">
              <path d="M2 2l8 8M10 2l-8 8" stroke={E_TEXT} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>タイトル</label>
            <input style={fld} value={draft.title || ''} autoFocus
              onChange={(e) => set('title', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: E_TEXT, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!draft.milestone}
                onChange={(e) => set('milestone', e.target.checked)} />
              マイルストーン
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>開始日</label>
              <input type="date" style={fld} value={draft.start || ''}
                onChange={(e) => set('start', e.target.value)} />
            </div>
            {!draft.milestone && (
              <div>
                <label style={lbl}>期限</label>
                <input type="date" style={fld} value={draft.end || ''}
                  onChange={(e) => set('end', e.target.value)} />
              </div>
            )}
          </div>

          {!draft.milestone && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>進捗（%）</label>
                <input type="number" min="0" max="100" style={fld}
                  value={draft.progress ?? 0}
                  onChange={(e) => set('progress', Number(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>工数（時間）</label>
                <input type="number" min="0" step="0.5" style={fld}
                  value={draft.hours ?? 0}
                  onChange={(e) => set('hours', Number(e.target.value))} />
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>優先度</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {window.PRIORITY_OPTS.map(p => (
                <button key={p.value} onClick={() => set('priority', p.value)} style={{
                  flex: 1, padding: '8px 10px', borderRadius: 8,
                  border: `1px solid ${draft.priority === p.value ? E_ACCENT : E_BORDER}`,
                  background: draft.priority === p.value ? E_ACCENT : '#fff',
                  color: draft.priority === p.value ? '#fff' : E_TEXT,
                  fontFamily: E_FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          {!draft.milestone && (
            <div>
              <label style={lbl}>親タスク（サブタスク化）</label>
              <select style={fld} value={draft.parent || ''}
                onChange={(e) => set('parent', e.target.value || null)}>
                <option value="">— なし（トップレベル）—</option>
                {eligibleParents.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={lbl}>先行タスク（依存）</label>
            {eligibleDeps.length === 0 ? (
              <div style={{ fontSize: 12, color: E_TEXT_FAINT, padding: '8px 0' }}>他のタスクなし</div>
            ) : (
              <div style={{
                maxHeight: 140, overflow: 'auto', border: `1px solid ${E_BORDER}`, borderRadius: 8,
                background: E_BG,
              }}>
                {eligibleDeps.map(t => (
                  <label key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', cursor: 'pointer', fontSize: 13,
                    borderBottom: `1px solid ${E_BORDER}`,
                  }}>
                    <input type="checkbox" checked={(draft.deps || []).includes(t.id)}
                      onChange={() => toggleDep(t.id)} />
                    <span style={{ flex: 1, color: E_TEXT,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.milestone ? '🏁 ' : ''}{t.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{
          display: 'flex', gap: 8, padding: 16,
          borderTop: `1px solid ${E_BORDER}`, justifyContent: 'space-between',
        }}>
          {!isNew ? (
            <button onClick={() => onDelete(draft.id)} style={btnStyle({ danger: true })}>削除</button>
          ) : <span />}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={btnStyle({ ghost: true })}>キャンセル</button>
            <button onClick={save} style={btnStyle({})}>{isNew ? '作成' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── + Add task button ─────────────────────────────────────────
function AddTaskButton({ onAdd, label = '+ タスク追加', accent }) {
  return (
    <button onClick={onAdd} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 8, border: 'none',
      background: accent || E_ACCENT, color: '#fff',
      fontFamily: E_FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  );
}

// ─── New task default ──────────────────────────────────────────
window.makeNewTask = function (opts = {}) {
  const today = new Date();
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const start = fmt(today);
  const end = new Date(today); end.setDate(end.getDate() + 7);
  return {
    id: window.genId('t'),
    title: '',
    start, end: fmt(end),
    progress: 0, hours: 1,
    parent: null, deps: [],
    priority: 'med', milestone: false,
    ...opts,
  };
};

window.useAppState = useAppState;
window.useConfirm = useConfirm;
window.ConfirmDialog = ConfirmDialog;
window.ProjectSwitcher = ProjectSwitcher;
window.TaskEditor = TaskEditor;
window.AddTaskButton = AddTaskButton;
