import { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { getActivities, createActivity, updateActivity, deleteActivity, getCompanies, getContacts, getDeals } from '../api';
import ActivityItem from '../components/ActivityItem';
import Modal from '../components/Modal';
import { ACT_TYPES, today, id, getAuthUser } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const EMPTY = { type:'Call', title:'', companyId:'', contactId:'', dealId:'', notes:'', date: today(), completed: false };

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ activities, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activityDates = useMemo(() => {
    const map = {};
    (activities || []).forEach(a => {
      if (!a.date) return;
      const d = a.date.split('T')[0];
      if (!map[d]) map[d] = { overdue: false, completed: false };
      if (a.completed) map[d].completed = true;
      else if (new Date(a.date) < new Date()) map[d].overdue = true;
    });
    return map;
  }, [activities]);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ minWidth:240 }}>
      <div className="row-between mb12">
        <button className="btn btn-sm btn-ghost" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
        <span className="fw5 f13">{MONTHS[month]} {year}</span>
        <button className="btn btn-sm btn-ghost" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center' }}>
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <div key={i} className="dim f11" style={{ padding:'4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const info       = activityDates[dateStr];
          const isSelected = selectedDate === dateStr;
          const isToday    = dateStr === today();
          return (
            <div key={i} onClick={() => info && onSelectDate(isSelected ? null : dateStr)}
              style={{
                padding:'4px 2px', borderRadius:6, fontSize:12,
                cursor: info ? 'pointer' : 'default',
                background: isSelected ? 'var(--text)' : isToday ? 'var(--bg2)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--text)',
                fontWeight: isToday ? 600 : 400,
              }}>
              {d}
              {info && (
                <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:1 }}>
                  {info.overdue   && <div style={{ width:4, height:4, borderRadius:'50%', background:'#E24B4A' }} />}
                  {info.completed && <div style={{ width:4, height:4, borderRadius:'50%', background:'#639922' }} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="row gap12 mt10" style={{ justifyContent:'center' }}>
        <span className="dim f11">🔴 late close</span>
        <span className="dim f11">🟢 on-time close</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Activities() {
  const { data: activities, loading, refetch } = useApi(getActivities);
  const { data: companies } = useApi(getCompanies);
  const { data: contacts  } = useApi(getContacts);
  const { data: deals     } = useApi(getDeals);

  const [tab,          setTab]          = useState('upcoming');
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { showToast } = useApp();

  const set = k => e => setForm(p => ({
    ...p, [k]: e.target.value,
    ...(k === 'companyId' ? { contactId:'', dealId:'' } : {}),
  }));

  const filtered = useMemo(() => {
    let list = (activities || []).filter(a => tab === 'upcoming' ? !a.completed : a.completed);
    if (selectedDate) list = list.filter(a => a.date && a.date.startsWith(selectedDate));
    return list;
  }, [activities, tab, selectedDate]);

  const companyContacts = (contacts||[]).filter(c => c.companyId === form.companyId);
  const companyDeals    = (deals||[]).filter(d => id(d.companyId) === form.companyId);

  const upcomingCount  = (activities||[]).filter(a => !a.completed).length;
  const completedCount = (activities||[]).filter(a =>  a.completed).length;

  function openCreate() { setForm(EMPTY); setEditTarget(null); setShowModal(true); }
  function openEdit(a) {
    setForm({
      type:      a.type,
      title:     a.title,
      companyId: a.companyId ? id(a.companyId) : '',
      contactId: a.contactId ? id(a.contactId) : '',
      dealId:    a.dealId    ? id(a.dealId)    : '',
      notes:     a.notes    || '',
      date:      a.date     ? a.date.split('T')[0] : today(),
      completed: a.completed,
    });
    setEditTarget(a);
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault(); if (!form.title) return; setSaving(true);
    try {
      if (editTarget) {
        await updateActivity(id(editTarget), form);
        showToast('Activity updated');
      } else {
        await createActivity({ ...form, owner: getAuthUser()?.name || 'Unknown' });
        showToast('Activity logged');
      }
      refetch(); setShowModal(false); setForm(EMPTY);
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(a) {
    if (!window.confirm('Delete this activity?')) return;
    try { await deleteActivity(id(a)); refetch(); showToast('Activity deleted'); }
    catch { showToast('Failed to delete'); }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>Activities</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Log activity</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, alignItems:'start' }}>

        {/* ── Calendar ── */}
        <div>
          <MiniCalendar
            activities={activities || []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          {selectedDate && (
            <button className="btn btn-sm btn-ghost"
              style={{ marginTop:8, width:'100%', justifyContent:'center', fontSize:12 }}
              onClick={() => setSelectedDate(null)}>
              ✕ Clear date filter
            </button>
          )}
        </div>

        {/* ── Activities list ── */}
        <div>
          <div className="pills mb16">
            <button className={'pill' + (tab === 'upcoming'  ? ' on' : '')} onClick={() => setTab('upcoming')}>
              Upcoming ({upcomingCount})
            </button>
            <button className={'pill' + (tab === 'completed' ? ' on' : '')} onClick={() => setTab('completed')}>
              Completed ({completedCount})
            </button>
          </div>

          {selectedDate && (
            <div className="f12 muted mb12">
              Showing activities for <strong>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
              </strong>
            </div>
          )}

          {loading ? <div className="muted f13">Loading…</div> : (
            <>
              {filtered.length === 0 && (
                <div className="f13 dim" style={{ padding:'20px 0' }}>
                  {selectedDate ? 'No activities on this date.' : `No ${tab} activities.`}
                </div>
              )}
              {filtered.map(a => (
                <ActivityItem
                  key={id(a)}
                  activity={a}
                  onRefetch={refetch}
                  onEdit={() => openEdit(a)}
                  onDelete={() => handleDelete(a)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? 'Edit activity' : 'Log activity'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="grid2">
              <div className="fg"><label>Type</label><select className="fselect" value={form.type} onChange={set('type')}>{ACT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label>Date</label><input className="finput" type="date" value={form.date} onChange={set('date')} /></div>
            </div>
            <div className="fg"><label>Title <span className="req">*</span></label><input className="finput" value={form.title} onChange={set('title')} placeholder="e.g. Discovery call" required /></div>
            <div className="fg"><label>Company</label>
              <select className="fselect" value={form.companyId} onChange={set('companyId')}>
                <option value="">— Select —</option>
                {(companies||[]).map(c => <option key={id(c)} value={id(c)}>{c.name}</option>)}
              </select></div>
            <div className="grid2">
              <div className="fg"><label>Contact</label>
                <select className="fselect" value={form.contactId} onChange={set('contactId')}>
                  <option value="">— Select —</option>
                  {companyContacts.map(c => <option key={id(c)} value={id(c)}>{c.firstName} {c.lastName}</option>)}
                </select></div>
              <div className="fg"><label>Deal (optional)</label>
                <select className="fselect" value={form.dealId} onChange={set('dealId')}>
                  <option value="">— Select —</option>
                  {companyDeals.map(d => <option key={id(d)} value={id(d)}>{d.title}</option>)}
                </select></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={form.notes} onChange={set('notes')} placeholder="Key takeaways, next steps…" /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Log activity'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
