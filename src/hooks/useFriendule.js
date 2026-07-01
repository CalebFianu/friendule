import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ymd, parseYmd, addDays, hhmm } from '../utils/dateUtils';
import { expandRules, getViewerZone } from '../utils/ruleExpander';
import { PALETTE, makeColorset } from '../utils/seedData';

const API_BASE = 'http://localhost:4000';
const VIEWER_ZONE = getViewerZone();

function toMins(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function timesOverlap(a, b) {
  if (a.allDay || b.allDay) return true;
  const aStart = toMins(a.timeStart);
  const aEnd   = toMins(a.timeEnd);
  const bStart = toMins(b.timeStart);
  const bEnd   = toMins(b.timeEnd);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return true;
  return aStart < bEnd && bStart < aEnd;
}

function rulesOverlap(a, b) {
  let sharesDay;
  if (a.recurrence === 'daily' || b.recurrence === 'daily') {
    sharesDay = true;
  } else if (a.recurrence === 'once' && b.recurrence === 'once') {
    sharesDay = a.date === b.date;
  } else if (a.recurrence === 'once' && b.recurrence === 'weekly') {
    sharesDay = b.weekdays?.includes(parseYmd(a.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'once') {
    sharesDay = a.weekdays?.includes(parseYmd(b.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'weekly') {
    sharesDay = a.weekdays?.some(wd => b.weekdays?.includes(wd));
  } else {
    sharesDay = false;
  }
  return sharesDay && timesOverlap(a, b);
}

// Derive display-only fields that the backend doesn't store
function hydrateFriend(f) {
  const words = f.name.split(/\s+/);
  return {
    ...f,
    firstName: words[0],
    initials: (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : words[0][1] || '')).toUpperCase(),
    colorset: makeColorset(f.color),
    status: f.description || 'Friend',
  };
}

export function useFriendule() {
  const savedAuth = JSON.parse(localStorage.getItem('friendule_auth') || 'null');
  const [auth, setAuth] = useState(savedAuth);
  const [authMode, setAuthMode] = useState('login');
  const [authFields, setAuthFields] = useState({ email: '', password: '', confirm: '' });
  const [authError, setAuthError] = useState(null);
  const [tab, setTab] = useState('friends');
  const [view, setView] = useState('month');
  const [friendIdx, setFriendIdx] = useState(0);
  const [cursor, setCursor] = useState(ymd(new Date()));
  const [prompt, setPrompt] = useState('');
  const [editor, setEditor] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [friendDay, setFriendDay] = useState(null);
  const [toast, setToast] = useState(null);
  const [addFriendModal, setAddFriendModal] = useState(null);
  const [everyoneFilter, setEveryoneFilter] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [clarification, setClarification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimer = useRef(null);

  const flash = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Authenticated fetch helper
  const apiFetch = useCallback(async (path, options = {}) => {
    const token = auth?.token;
    const res = await fetch(API_BASE + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  }, [auth]);

  // Load friends + rules from backend on login
  useEffect(() => {
    if (!auth?.token) return;
    setLoading(true);
    Promise.all([
      apiFetch('/friends'),
      apiFetch('/rules'),
    ]).then(([friendsData, rulesData]) => {
      setFriends((friendsData.friends || []).map(hydrateFriend));
      setRules(rulesData.rules || []);
      setFriendIdx(0);
    }).catch(err => {
      flash('Failed to load data: ' + err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [auth?.token, apiFetch, flash]);

  const cur = parseYmd(cursor);
  const friend = friends[friendIdx] || null;

  // Compute visible date range for expansion
  const visibleRange = useMemo(() => {
    if (view === 'week' && tab === 'friends') {
      const ws = addDays(cur, -cur.getDay());
      return { start: ymd(ws), end: ymd(addDays(ws, 6)) };
    }
    const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    return { start: ymd(gridStart), end: ymd(addDays(gridStart, 41)) };
  }, [cur, view, tab]);

  // Pre-expand all rules for the visible range, keyed by friendId
  const expandedByFriend = useMemo(() => {
    const map = {};
    for (const f of friends) {
      const friendRules = rules.filter(r => r.friendId === f.id);
      map[f.id] = expandRules(friendRules, f.timezone || 'Africa/Accra', VIEWER_ZONE, visibleRange.start, visibleRange.end);
    }
    return map;
  }, [friends, rules, visibleRange]);

  function instances(fid, y) {
    const expanded = expandedByFriend[fid] || [];
    return expanded
      .filter(e => e.date === y)
      .sort((a, b) => (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || (a.startMin || 0) - (b.startMin || 0));
  }

  const friendConflicts = useMemo(() => {
    if (!friend) return [];
    const fr = rules.filter(r => r.friendId === friend.id && r.status !== 'together');
    const pairs = [];
    for (let i = 0; i < fr.length; i++) {
      for (let j = i + 1; j < fr.length; j++) {
        const a = fr[i], b = fr[j];
        if (a.status !== b.status && rulesOverlap(a, b)) pairs.push([a, b]);
      }
    }
    return pairs;
  }, [rules, friend]);

  function busyOn(fid, y) {
    return instances(fid, y).some(e => e.status === 'busy');
  }

  // Navigation
  const goFriends = () => setTab('friends');
  const goEveryone = () => setTab('everyone');
  const setMonthView = () => setView('month');
  const setWeekView = () => setView('week');
  const prevFriend = () => setFriendIdx(i => (i - 1 + friends.length) % friends.length);
  const nextFriend = () => setFriendIdx(i => (i + 1) % friends.length);
  const pickFriend = (i) => { setFriendIdx(i); setTab('friends'); };
  const goToday = () => setCursor(ymd(new Date()));

  const prevPeriod = () => {
    if (view === 'week' && tab === 'friends') setCursor(ymd(addDays(cur, -7)));
    else setCursor(ymd(new Date(cur.getFullYear(), cur.getMonth() - 1, 1)));
  };
  const nextPeriod = () => {
    if (view === 'week' && tab === 'friends') setCursor(ymd(addDays(cur, 7)));
    else setCursor(ymd(new Date(cur.getFullYear(), cur.getMonth() + 1, 1)));
  };

  // Everyone filter
  const toggleEveryoneFilter = (id) => {
    setEveryoneFilter(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };
  const clearEveryoneFilter = () => setEveryoneFilter([]);

  const transcribe = useCallback(async (audioBase64, mimeType) => {
    return apiFetch('/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audio: audioBase64, mimeType }),
    });
  }, [apiFetch]);

  // Returns true if a rule matches the filter criteria from the LLM
  function matchesFilter(rule, filter) {
    if (!filter) return false;
    if (filter.all) return true;

    if (filter.status && filter.status !== 'any' && rule.status !== filter.status) return false;
    if (filter.recurrence && filter.recurrence !== 'any' && rule.recurrence !== filter.recurrence) return false;

    if (filter.date) {
      if (rule.recurrence !== 'once' || rule.date !== filter.date) return false;
    }

    if (filter.weekdays && filter.weekdays.length > 0) {
      if (rule.recurrence === 'weekly') {
        if (!rule.weekdays?.some(wd => filter.weekdays.includes(wd))) return false;
      } else if (rule.recurrence === 'once') {
        const ruleWd = parseYmd(rule.date).getDay();
        if (!filter.weekdays.includes(ruleWd)) return false;
      }
      // daily rules match any weekday filter
    }

    if (filter.title_keywords && filter.title_keywords.length > 0) {
      const titleLower = (rule.title || '').toLowerCase();
      if (!filter.title_keywords.some(kw => titleLower.includes(kw.toLowerCase()))) return false;
    }

    return true;
  }

  // Prompt / LLM parse → persist rules to backend
  const commitPrompt = async () => {
    const text = prompt.trim();
    if (!text) { flash('Type a schedule description first'); return; }
    if (!friend) { flash('Add a friend first'); return; }

    setParsing(true);
    setClarification(null);

    try {
      const friendRules = rules.filter(r => r.friendId === friend.id);

      const data = await apiFetch('/parse', {
        method: 'POST',
        body: JSON.stringify({
          text,
          existingRules: friendRules.map(r => ({
            title: r.title,
            status: r.status,
            recurrence: r.recurrence,
            weekdays: r.weekdays,
            date: r.date,
            timeStart: r.timeStart,
            timeEnd: r.timeEnd,
            allDay: r.allDay,
          })),
        }),
      });

      if (data.clarification_needed) {
        setClarification(data.clarification_needed);
        return;
      }

      const intent = data.intent || 'create';

      if (intent === 'delete') {
        const toDelete = friendRules.filter(r => matchesFilter(r, data.delete_filter));
        if (toDelete.length === 0) {
          flash('No matching rules found to delete');
          return;
        }
        setConfirmDialog({
          intent: 'delete',
          affectedRules: toDelete,
          updateFields: null,
          onConfirm: async () => {
            setConfirmDialog(null);
            try {
              for (const rule of toDelete) {
                await apiFetch('/rules/' + rule.id, { method: 'DELETE' });
                setRules(prev => prev.filter(r => r.id !== rule.id));
              }
              setPrompt('');
              flash('Removed ' + toDelete.length + ' rule' + (toDelete.length > 1 ? 's' : ''));
            } catch (err) {
              flash('Delete failed: ' + err.message);
            }
          },
          onCancel: () => setConfirmDialog(null),
        });
        return;
      }

      if (intent === 'update') {
        const { update_filter, update_fields } = data;
        const toUpdate = friendRules.filter(r => matchesFilter(r, update_filter));
        if (toUpdate.length === 0) {
          flash('No matching rules found to update');
          return;
        }
        setConfirmDialog({
          intent: 'update',
          affectedRules: toUpdate,
          updateFields: update_fields,
          onConfirm: async () => {
            setConfirmDialog(null);
            try {
              for (const rule of toUpdate) {
                const body = {
                  friendId: rule.friendId,
                  title: update_fields.title ?? rule.title,
                  status: update_fields.status ?? rule.status,
                  allDay: update_fields.allDay ?? rule.allDay,
                  timeStart: (update_fields.allDay ?? rule.allDay) ? null : (update_fields.timeStart ?? rule.timeStart),
                  timeEnd: (update_fields.allDay ?? rule.allDay) ? null : (update_fields.timeEnd ?? rule.timeEnd),
                  recurrence: update_fields.recurrence ?? rule.recurrence,
                  weekdays: update_fields.weekdays ?? rule.weekdays,
                  date: update_fields.date ?? rule.date,
                  rawText: rule.rawText || '',
                };
                const updated = await apiFetch('/rules/' + rule.id, { method: 'PUT', body: JSON.stringify(body) });
                setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
              }
              setPrompt('');
              flash('Updated ' + toUpdate.length + ' rule' + (toUpdate.length > 1 ? 's' : ''));
            } catch (err) {
              flash('Update failed: ' + err.message);
            }
          },
          onCancel: () => setConfirmDialog(null),
        });
        return;
      }

      // create (default)
      if (!data.rules || data.rules.length === 0) {
        flash("Couldn't extract any schedule rules from that");
        return;
      }

      const saved = [];
      let skipped = 0;
      for (const r of data.rules) {
        const body = { ...r, friendId: friend.id, rawText: text };
        if (hasStatusConflict(body, null)) {
          skipped++;
          continue;
        }
        const created = await apiFetch('/rules', { method: 'POST', body: JSON.stringify(body) });
        saved.push(created);
        setRules(prev => [...prev, created]);
      }

      setPrompt('');
      setClarification(null);
      if (saved.length === 0) {
        flash('All parsed rules conflicted with existing schedule — none added');
      } else {
        flash('Added ' + saved.length + ' rule' + (saved.length > 1 ? 's' : '') + ' for ' + friend.firstName + (skipped ? ' (' + skipped + ' conflict' + (skipped > 1 ? 's' : '') + ' skipped)' : ''));
      }
    } catch (err) {
      flash('Error: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  // Editor
  const openNew = (y, startMin) => {
    if (!friend) return;
    const wd = parseYmd(y).getDay();
    setEditor({
      mode: 'new', friendId: friend.id, title: '', status: 'busy', allDay: false,
      start: hhmm(startMin != null ? startMin : 720),
      end: hhmm((startMin != null ? startMin : 720) + 60),
      repeat: 'once', date: y, weekdays: [wd],
    });
  };
  const addBlank = () => openNew(cursor, 720);

  const openEdit = (interval) => {
    const rule = rules.find(r => r.id === interval.ruleId);
    if (rule) {
      setEditor({
        mode: 'edit', id: rule.id, friendId: rule.friendId, title: rule.title, status: rule.status,
        allDay: rule.allDay,
        start: rule.timeStart || '09:00',
        end: rule.timeEnd || '10:00',
        repeat: rule.recurrence === 'weekly' ? 'weekly' : rule.recurrence === 'daily' ? 'daily' : 'once',
        date: rule.date || cursor,
        weekdays: rule.weekdays ? [...rule.weekdays] : [parseYmd(rule.date || cursor).getDay()],
      });
    }
  };

  const patchEd = (p) => setEditor(ed => ({ ...ed, ...p }));
  const toggleWd = (n) => setEditor(ed => {
    const w = ed.weekdays.includes(n) ? ed.weekdays.filter(x => x !== n) : [...ed.weekdays, n];
    return { ...ed, weekdays: w };
  });
  const closeEditor = () => setEditor(null);

  const hasStatusConflict = (body, excludeId) => {
    if (body.status === 'together') return false;
    const opposite = body.status === 'busy' ? 'free' : 'busy';
    const candidates = rules.filter(r => r.friendId === body.friendId && r.id !== excludeId && r.status === opposite);
    return candidates.some(r => rulesOverlap(body, r));
  };

  const saveEvent = async () => {
    if (!editor) return;
    const recurrence = editor.repeat === 'weekly' ? 'weekly' : editor.repeat === 'daily' ? 'daily' : 'once';
    const body = {
      friendId: editor.friendId,
      title: (editor.title || '').trim() || 'Untitled',
      status: editor.status,
      allDay: editor.allDay,
      timeStart: editor.allDay ? null : editor.start,
      timeEnd: editor.allDay ? null : editor.end,
      recurrence,
      weekdays: recurrence === 'weekly'
        ? (editor.weekdays.length ? [...editor.weekdays].sort((a, b) => a - b) : [parseYmd(editor.date).getDay()])
        : undefined,
      date: recurrence === 'once' ? editor.date : undefined,
      rawText: '',
    };

    if (hasStatusConflict(body, editor.id)) {
      flash('Conflict: this friend already has a ' + (body.status === 'busy' ? 'free' : 'busy') + ' rule on that day');
      return;
    }

    try {
      if (editor.mode === 'edit') {
        const updated = await apiFetch('/rules/' + editor.id, { method: 'PUT', body: JSON.stringify(body) });
        setRules(prev => prev.map(r => r.id === editor.id ? updated : r));
        flash('Updated');
      } else {
        const created = await apiFetch('/rules', { method: 'POST', body: JSON.stringify(body) });
        setRules(prev => [...prev, created]);
        flash('Rule added');
      }
      setEditor(null);
    } catch (err) {
      flash('Save failed: ' + err.message);
    }
  };

  const deleteEvent = async () => {
    if (!editor || editor.mode !== 'edit') return;
    try {
      await apiFetch('/rules/' + editor.id, { method: 'DELETE' });
      setRules(prev => prev.filter(r => r.id !== editor.id));
      setEditor(null);
      flash('Removed');
    } catch (err) {
      flash('Delete failed: ' + err.message);
    }
  };

  const deleteRule = async (id) => {
    try {
      await apiFetch('/rules/' + id, { method: 'DELETE' });
      setRules(prev => prev.filter(r => r.id !== id));
      flash('Removed');
    } catch (err) {
      flash('Delete failed: ' + err.message);
    }
  };

  // Add friend
  const openAddFriend = () => setAddFriendModal({ name: '', description: '', timezone: 'Africa/Accra' });
  const closeAddFriend = () => setAddFriendModal(null);
  const patchAf = (p) => setAddFriendModal(af => ({ ...af, ...p }));
  const saveNewFriend = async () => {
    if (!addFriendModal) return;
    const name = (addFriendModal.name || '').trim();
    if (!name) { flash('Please enter a name'); return; }

    const used = friends.map(f => f.color);
    const color = PALETTE.find(c => !used.includes(c)) || PALETTE[friends.length % PALETTE.length];

    try {
      const created = await apiFetch('/friends', {
        method: 'POST',
        body: JSON.stringify({
          name,
          color,
          description: (addFriendModal.description || '').trim(),
          timezone: addFriendModal.timezone || 'Africa/Accra',
        }),
      });
      const hydrated = hydrateFriend(created);
      setFriends(f => [...f, hydrated]);
      setFriendIdx(friends.length);
      setAddFriendModal(null);
      setTab('friends');
      flash(hydrated.firstName + ' added!');
    } catch (err) {
      flash('Failed to add friend: ' + err.message);
    }
  };

  // Auth
  const submitAuth = async () => {
    const e = authFields.email.trim().toLowerCase();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setAuthError('Please enter a valid email.'); return; }
    if (authFields.password.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    if (authMode === 'register' && authFields.password !== authFields.confirm) {
      setAuthError("Passwords don't match."); return;
    }

    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: authFields.password }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || 'Auth failed'); return; }

      const a = { email: e, token: data.token };
      localStorage.setItem('friendule_auth', JSON.stringify(a));
      setAuth(a);
      setAuthError(null);
      setAuthFields({ email: '', password: '', confirm: '' });
    } catch (err) {
      setAuthError('Could not reach server: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('friendule_auth');
    setAuth(null);
    setFriends([]);
    setRules([]);
    setFriendIdx(0);
    setAuthMode('login');
    setAuthFields({ email: '', password: '', confirm: '' });
    setAuthError(null);
    setEditor(null);
    setDayDetail(null);
    setAddFriendModal(null);
  };

  // Day detail
  const openDay = (y) => {
    const rows = friends.map(f => {
      const evs = instances(f.id, y);
      const busy = evs.some(e => e.status === 'busy');
      const together = !busy && evs.some(e => e.status === 'together');
      return { f, evs, busy, together };
    });
    setDayDetail({ ymd: y, rows });
  };
  const closeDay = () => setDayDetail(null);

  // Friend-scoped day panel (per-friend calendar click)
  const openFriendDay = (y, startMin) => {
    if (!friend) return;
    const evs = instances(friend.id, y);
    if (evs.length > 0) {
      setFriendDay({ ymd: y, startMin: startMin ?? 720, evs });
    } else {
      openNew(y, startMin);
    }
  };
  const closeFriendDay = () => setFriendDay(null);

  return {
    auth, authMode, authFields, authError,
    setAuthMode, setAuthFields: (p) => { setAuthFields(f => ({ ...f, ...p })); setAuthError(null); },
    submitAuth, logout,
    tab, view, friendIdx, cursor, prompt, editor, dayDetail, friendDay, toast, addFriendModal, everyoneFilter,
    friends, rules, cur, friend, loading,
    parsing, clarification, setClarification, confirmDialog, transcribe,
    goFriends, goEveryone, setMonthView, setWeekView,
    prevFriend, nextFriend, pickFriend, goToday, prevPeriod, nextPeriod,
    setPrompt, commitPrompt,
    toggleEveryoneFilter, clearEveryoneFilter,
    openNew, addBlank, openEdit, patchEd, toggleWd, closeEditor, saveEvent, deleteEvent, deleteRule,
    openAddFriend, closeAddFriend, patchAf, saveNewFriend,
    openDay, closeDay,
    openFriendDay, closeFriendDay,
    instances, busyOn, flash,
    friendConflicts,
    viewerZone: VIEWER_ZONE,
  };
}
