import { prettyDate, fmtTime } from '../utils/dateUtils';
import { Badge, Button } from './ds.jsx';

function statusTone(status) {
  if (status === 'busy') return 'danger';
  if (status === 'together') return 'together';
  return 'success';
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
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px', zIndex: 50,
        animation: 'ovin .2s ease both',
      }}
      onClick={closeFriendDay}
    >
      <div
        style={{
          width: '400px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '22px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)' }}>
              {prettyDate(friendDay.ymd)}
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {friend.isSelf ? 'Your schedule' : friend.firstName + '\u2019s schedule'}
            </div>
          </div>
          <button
            style={{
              flexShrink: 0, width: '34px', height: '34px', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--surface-inset)',
              color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer',
            }}
            onClick={closeFriendDay}
          >&#10005;</button>
        </div>

        {/* Event list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {friendDay.evs.length === 0 && (
            <div style={{
              padding: '20px', textAlign: 'center',
              color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)',
              background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)',
            }}>
              No events — wide open!
            </div>
          )}
          {friendDay.evs.map(e => (
            <div
              key={e.id}
              onClick={() => handleEdit(e)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px', cursor: 'pointer',
                transition: 'background var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={ev => ev.currentTarget.style.background = ''}
            >
              {/* Color dot */}
              <span style={{
                flex: '0 0 auto', width: '10px', height: '10px', borderRadius: '50%',
                background: e.fromFriend
                  ? e.fromFriend.colorset.solid
                  : e.status === 'busy' ? cs.solid
                  : e.status === 'together' ? 'var(--cat-violet-ink)'
                  : 'var(--cat-mint-ink)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)',
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{e.title}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {e.fromFriend ? 'with ' + e.fromFriend.firstName + ' · ' : ''}
                  {e.allDay ? 'All day' : fmtTime(e.startMin) + ' – ' + fmtTime(e.endMin)}
                </div>
              </div>
              <Badge tone={statusTone(e.status)}>{e.status === 'busy' ? 'Busy' : e.status === 'together' ? 'Together' : 'Free'}</Badge>
            </div>
          ))}
        </div>

        {/* Add event */}
        <Button variant="ink" full style={{ marginTop: '16px' }} onClick={handleAddEvent}>
          + Add event on this day
        </Button>
      </div>
    </div>
  );
}
