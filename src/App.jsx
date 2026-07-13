import { useState, useEffect } from 'react';
import { useFriendule } from './hooks/useFriendule';
import { MONTHS, addDays } from './utils/dateUtils';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import FriendSwitcher from './components/FriendSwitcher';
import PromptBox from './components/PromptBox';
import MonthGrid from './components/MonthGrid';
import WeekView from './components/WeekView';
import EveryoneView from './components/EveryoneView';
import EventEditor from './components/EventEditor';
import DayDetail from './components/DayDetail';
import FriendDayPanel from './components/FriendDayPanel';
import ConflictBanner from './components/ConflictBanner';
import AddFriendModal from './components/AddFriendModal';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ClarificationModal from './components/ClarificationModal';
import { SegmentedControl, IconButton, Button } from './components/ds.jsx';

export default function App() {
  const state = useFriendule();

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('friendule-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('friendule-theme', darkMode ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [darkMode]);

  if (!state.auth) {
    return (
      <LandingPage
        authMode={state.authMode}
        authFields={state.authFields}
        authError={state.authError}
        setAuthMode={state.setAuthMode}
        setAuthFields={state.setAuthFields}
        submitAuth={state.submitAuth}
        darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
      />
    );
  }

  if (state.loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-canvas)',
      }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>
          Loading&#8230;
        </div>
      </div>
    );
  }

  const { cur, view, tab } = state;
  const isMonth = view === 'month';
  const isWeek  = view === 'week';

  const monthLabel = MONTHS[cur.getMonth()] + ' ' + cur.getFullYear();
  let periodLabel = monthLabel;
  if (isWeek && (tab === 'friends' || tab === 'personal')) {
    const ws = addDays(cur, -cur.getDay());
    const we = addDays(ws, 6);
    periodLabel = MONTHS[ws.getMonth()] + ' ' + ws.getDate()
      + ' – '
      + (ws.getMonth() !== we.getMonth() ? MONTHS[we.getMonth()] + ' ' : '')
      + we.getDate();
  }

  const calendarControls = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', margin: '18px 0 12px' }}>
      <SegmentedControl
        options={['month', 'week']}
        value={view}
        onChange={v => { if (v === 'month') state.setMonthView(); else state.setWeekView(); }}
        size="sm"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconButton shape="circle" size="sm" onClick={state.prevPeriod} aria-label="Previous period">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </IconButton>
        <div style={{
          fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-body)', minWidth: '150px', textAlign: 'center',
          color: 'var(--text-primary)',
        }}>{periodLabel}</div>
        <IconButton shape="circle" size="sm" onClick={state.nextPeriod} aria-label="Next period">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </IconButton>
        <button
          onClick={state.goToday}
          style={{
            border: '1px solid var(--border-strong)', background: 'var(--surface-card)',
            color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)',
            padding: '6px 13px', fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', cursor: 'pointer',
            marginLeft: '2px',
            transition: 'background var(--dur-fast) var(--ease-out)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card)'}
        >Today</button>
      </div>

      <Button variant="ink" size="sm" onClick={state.addBlank}>+ Add event</Button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(14px,2.5vw,32px)' }}>

        <Header
          tab={tab}
          goFriends={state.goFriends}
          goEveryone={state.goEveryone}
          goPersonal={state.goPersonal}
          auth={state.auth}
          logout={state.logout}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(d => !d)}
        />

        {/* ── MY CALENDAR ── */}
        {tab === 'personal' && (
          <div style={{ animation: 'flin .25s ease both' }}>
            {!state.personalFriend ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>
                  Setting up your calendar\u2026
                </div>
              </div>
            ) : (
              <>
                {/* Personal header card */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px',
                  padding: '14px 18px',
                  background: 'var(--surface-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 'var(--fw-bold)', fontSize: '18px', fontFamily: 'var(--font-sans)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {state.auth.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)' }}>My Calendar</div>
                    <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '1px' }}>Your personal schedule</div>
                  </div>
                </div>

                <PromptBox
                  friend={state.personalFriend}
                  prompt={state.prompt}
                  setPrompt={state.setPrompt}
                  commitPrompt={state.commitPrompt}
                  parsing={state.parsing}
                  transcribe={state.transcribe}
                />

                {calendarControls}

                {isMonth && (
                  <MonthGrid cur={cur} friend={state.personalFriend} instances={(_, date) => state.personalInstances(date)} openFriendDay={state.openFriendDay} openEdit={state.openEdit} />
                )}
                {isWeek && (
                  <WeekView cur={cur} friend={state.personalFriend} instances={(_, date) => state.personalInstances(date)} openFriendDay={state.openFriendDay} openEdit={state.openEdit} />
                )}
              </>
            )}
          </div>
        )}

        {/* ── PER FRIEND ── */}
        {tab === 'friends' && (
          <div style={{ animation: 'flin .25s ease both' }}>
            {!state.friend ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh', gap: '16px',
              }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-h3)', color: 'var(--text-primary)' }}>
                  Welcome to Friendule!
                </div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>Add a friend to get started.</div>
                <Button variant="ink" onClick={state.openAddFriend}>+ Add your first friend</Button>
              </div>
            ) : (
              <>
                <FriendSwitcher
                  friend={state.friend}
                  friends={state.regularFriends}
                  friendIdx={state.friendIdx}
                  prevFriend={state.prevFriend}
                  nextFriend={state.nextFriend}
                  pickFriend={state.pickFriend}
                  openAddFriend={state.openAddFriend}
                  instances={state.instances}
                />

                <ConflictBanner conflicts={state.friendConflicts} deleteEvent={state.deleteRule} openEdit={state.openEdit} />

                <PromptBox
                  friend={state.friend}
                  prompt={state.prompt}
                  setPrompt={state.setPrompt}
                  commitPrompt={state.commitPrompt}
                  parsing={state.parsing}
                  transcribe={state.transcribe}
                />

                {calendarControls}

                {isMonth && (
                  <MonthGrid cur={cur} friend={state.friend} instances={state.instances} openFriendDay={state.openFriendDay} openEdit={state.openEdit} />
                )}
                {isWeek && (
                  <WeekView cur={cur} friend={state.friend} instances={state.instances} openFriendDay={state.openFriendDay} openEdit={state.openEdit} />
                )}
              </>
            )}
          </div>
        )}

        {/* ── EVERYONE ── */}
        {tab === 'everyone' && (
          <EveryoneView
            cur={cur}
            friends={state.regularFriends}
            everyoneFilter={state.everyoneFilter}
            busyOn={state.busyOn}
            toggleEveryoneFilter={state.toggleEveryoneFilter}
            clearEveryoneFilter={state.clearEveryoneFilter}
            prevPeriod={state.prevPeriod}
            nextPeriod={state.nextPeriod}
            goToday={state.goToday}
            openDay={state.openDay}
          />
        )}

      </div>

      {/* Overlays */}
      <EventEditor      editor={state.editor}       patchEd={state.patchEd}         toggleWd={state.toggleWd}         closeEditor={state.closeEditor}       saveEvent={state.saveEvent}   deleteEvent={state.deleteEvent} />
      <FriendDayPanel   friendDay={state.friendDay}  friend={state.effectiveFriend}  openEdit={state.openEdit}         openNew={state.openNew}               closeFriendDay={state.closeFriendDay} />
      <DayDetail        dayDetail={state.dayDetail}  closeDay={state.closeDay} />
      <AddFriendModal   addFriendModal={state.addFriendModal} patchAf={state.patchAf} closeAddFriend={state.closeAddFriend} saveNewFriend={state.saveNewFriend} />
      <ClarificationModal
        clarification={state.clarification}
        onConfirm={state.confirmClarification}
        onCancel={state.dismissClarification}
      />
      <ConfirmDialog    confirmDialog={state.confirmDialog} />
      <Toast            message={state.toast} />
    </div>
  );
}
