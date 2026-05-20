import { formatDate, ACT_COLORS, isOverdue, id } from '../utils/helpers';
import { toggleActivity } from '../api';
import { useApp } from '../context/AppContext';

export default function ActivityItem({ activity: a, onRefetch }) {
  const { showToast } = useApp();
  const color  = ACT_COLORS[a.type] || '#888';
  const overdue = !a.completed && isOverdue(a.date);
  const coName  = a.companyId?.name  || a.companyName  || '';
  const contact = a.contactId ? `${a.contactId.firstName} ${a.contactId.lastName}` : '';

  async function handleToggle() {
    try { await toggleActivity(id(a)); onRefetch?.(); }
    catch { showToast('Failed to update'); }
  }

  return (
    <div className="act-row">
      <div className={'chk' + (a.completed ? ' on' : '')} onClick={handleToggle}>
        {a.completed && <span style={{ fontSize: 10, color: '#3B6D11' }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap8 mb4" style={{ flexWrap: 'wrap' }}>
          <span className="fw5 f13" style={{ textDecoration: a.completed ? 'line-through' : 'none', color: a.completed ? 'var(--text3)' : 'inherit' }}>
            {a.title}
          </span>
          <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: color + '22', color, fontWeight: 500 }}>{a.type}</span>
          {overdue    && <span className="badge" style={{ background:'#FCEBEB', color:'#A32D2D', fontSize:10 }}>Overdue</span>}
          {a.completed && <span className="badge" style={{ background:'#EAF3DE', color:'#3B6D11', fontSize:10 }}>Done</span>}
        </div>
        {a.notes && <div className="f12 muted mb4">{a.notes}</div>}
        <div className="f11 dim">
          {formatDate(a.date)}{coName ? ` · ${coName}` : ''}{contact ? ` · ${contact}` : ''}
        </div>
      </div>
    </div>
  );
}