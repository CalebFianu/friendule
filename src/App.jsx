import { useFriendule } from './hooks/useFriendule';
import { MONTHS, WEEKDAYS, addDays } from './utils/dateUtils';
import AuthScreen from './components/AuthScreen';
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

export default function App() {
  const state = useFriendule();

  if (!state.auth) {
    return (
      <AuthScreen
        authMode={state.authMode}
        authFields={state.authFields}
        authError={state.authError}
        setAuthMode={state.setAuthMode}
        setAuthFields={state.setAuthFields}
        submitAuth={state.submitAuth}
      />
    );
  }

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF6F0' }}>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '17px', color: '#9A8E83' }}>Loading&#8230;</div>
      </div>
    );
  }

  const { cur, view, tab } = state;
  const isMonth = view === 'month';
  const isWeek = view === 'week';

  const segOn = { background: '#fff', color: '#3A322C', border: 'none', borderRadius: '999px', padding: '7px 16px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(80,55,30,.16)' };
  const segOff = { background: 'transparent', color: '#8C7E70', border: 'none', borderRadius: '999px', padding: '7px 16px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };

  // Period label
  const monthLabel = MONTHS[cur.getMonth()] + ' ' + cur.getFullYear();
  let periodLabel = monthLabel;
  if (isWeek && tab === 'friends') {
    const ws = addDays(cur, -cur.getDay());
    const we = addDays(ws, 6);
    periodLabel = MONTHS[ws.getMonth()] + ' ' + ws.getDate() + ' – ' + (ws.getMonth() !== we.getMonth() ? MONTHS[we.getMonth()] + ' ' : '') + we.getDate();
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#FBF6F0', backgroundImage: 'radial-gradient(900px 520px at 6% -12%, oklch(0.87 0.075 70 / .55), transparent 60%),radial-gradient(820px 520px at 100% -4%, oklch(0.85 0.085 28 / .42), transparent 56%),radial-gradient(760px 620px at 92% 112%, oklch(0.86 0.06 255 / .38), transparent 56%),radial-gradient(circle, oklch(0.5 0.03 60 / .055) 1.1px, transparent 1.1px)', backgroundSize: 'auto,auto,auto,24px 24px', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(16px,3vw,34px)' }}>
        <Header tab={tab} goFriends={state.goFriends} goEveryone={state.goEveryone} auth={state.auth} logout={state.logout} />

        {tab === 'friends' && (
          <div style={{ animation: 'flin .25s ease both' }}>
            {!state.friend ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
                <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '22px', color: '#3A322C' }}>Welcome to Friendule!</div>
                <div style={{ fontSize: '15px', color: '#9A8E83', fontWeight: 600 }}>Add a friend to get started.</div>
                <button style={{ border: 'none', background: '#3A322C', color: '#fff', borderRadius: '999px', padding: '12px 24px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={state.openAddFriend}>+ Add your first friend</button>
              </div>
            ) : (
              <>
                <FriendSwitcher
                  friend={state.friend}
                  friends={state.friends}
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
                  clarification={state.clarification}
                  setClarification={state.setClarification}
                />

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', margin: '18px 2px 12px' }}>
                  <div style={{ display: 'flex', background: '#fff', border: '1px solid #EFE7DD', borderRadius: '999px', padding: '4px' }}>
                    <button style={isMonth ? segOn : segOff} onClick={state.setMonthView}>Month</button>
                    <button style={isWeek ? segOn : segOff} onClick={state.setWeekView}>Week</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button style={{ width: '36px', height: '36px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={state.prevPeriod}>&lsaquo;</button>
                    <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '17px', minWidth: '150px', textAlign: 'center' }}>{periodLabel}</div>
                    <button style={{ width: '36px', height: '36px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={state.nextPeriod}>&rsaquo;</button>
                    <button style={{ marginLeft: '4px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', borderRadius: '999px', padding: '8px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }} onClick={state.goToday}>Today</button>
                  </div>
                  <button style={{ border: 'none', background: '#3A322C', color: '#fff', borderRadius: '999px', padding: '9px 16px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={state.addBlank}>+ Add event</button>
                </div>

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

        {tab === 'everyone' && (
          <EveryoneView
            cur={cur}
            friends={state.friends}
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

      <EventEditor editor={state.editor} patchEd={state.patchEd} toggleWd={state.toggleWd} closeEditor={state.closeEditor} saveEvent={state.saveEvent} deleteEvent={state.deleteEvent} />
      <FriendDayPanel friendDay={state.friendDay} friend={state.friend} openEdit={state.openEdit} openNew={state.openNew} closeFriendDay={state.closeFriendDay} />
      <DayDetail dayDetail={state.dayDetail} closeDay={state.closeDay} />
      <AddFriendModal addFriendModal={state.addFriendModal} patchAf={state.patchAf} closeAddFriend={state.closeAddFriend} saveNewFriend={state.saveNewFriend} />
      <Toast message={state.toast} />
    </div>
  );
}
