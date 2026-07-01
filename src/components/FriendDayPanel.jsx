import { prettyDate, fmtTime } from '../utils/dateUtils';

function statusStyle(status) {
  if (status === 'busy') return { fontSize: '11px', fontWeight: 800, color: '#C0563E', background: '#FBEDE7', padding: '1px 8px', borderRadius: '999px' };
  if (status === 'together') return { fontSize: '11px', fontWeight: 800, color: '#A0357A', background: '#FDE8F5', padding: '1px 8px', borderRadius: '999px' };
  return { fontSize: '11px', fontWeight: 800, color: '#2A7A50', background: '#E6F4ED', padding: '1px 8px', borderRadius: '999px' };
}

function statusLabel(status) {
  if (status === 'busy') return 'Busy';
  if (status === 'together') return 'Together';
  return 'Free';
}

export default function FriendDayPanel({ friendDay, friend, openEdit, openNew, closeFriendDay }) {
  if (!friendDay || !friend) return null;
  const cs = friend.colorset;

  const handleAddEvent = () => {
    closeFriendDay();
    openNew(friendDay.ymd, friendDay.startMin);
  };

  const handleEdit = (e) => {
    closeFriendDay();
    openEdit(e);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(58,42,28,.34)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', zIndex: 50, animation: 'ovin .2s ease both' }}
      onClick={closeFriendDay}
    >
      <div
        style={{ width: '400px', maxWidth: '100%', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: '24px', padding: '22px', boxShadow: '0 24px 60px rgba(58,42,28,.28)', animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 800, fontSize: '18px', color: '#3A322C' }}>{prettyDate(friendDay.ymd)}</div>
            <div style={{ fontSize: '13px', color: '#9A8E83', fontWeight: 600, marginTop: '2px' }}>{friend.firstName}&apos;s schedule</div>
          </div>
          <button
            style={{ width: '34px', height: '34px', borderRadius: '999px', border: 'none', background: '#F3ECE2', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}
            onClick={closeFriendDay}
          >✕</button>
        </div>

        {/* Event list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {friendDay.evs.map(e => (
            <div
              key={e.id}
              onClick={() => handleEdit(e)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #F1EAE0', borderRadius: '14px', padding: '11px 14px', cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = '#FBF6F0'}
              onMouseLeave={ev => ev.currentTarget.style.background = ''}
            >
              <div style={{ flex: '0 0 auto', width: '10px', height: '10px', borderRadius: '999px', background: e.status === 'busy' ? cs.solid : e.status === 'together' ? '#A0357A' : '#4CAF72' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#3A322C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#9A8E83', marginTop: '1px' }}>
                  {e.allDay ? 'All day' : fmtTime(e.startMin) + ' – ' + fmtTime(e.endMin)}
                </div>
              </div>
              <span style={statusStyle(e.status)}>{statusLabel(e.status)}</span>
            </div>
          ))}
        </div>

        {/* Add event */}
        <button
          onClick={handleAddEvent}
          style={{ marginTop: '16px', width: '100%', border: 'none', background: '#3A322C', color: '#fff', borderRadius: '14px', padding: '13px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
        >
          + Add event on this day
        </button>
      </div>
    </div>
  );
}
