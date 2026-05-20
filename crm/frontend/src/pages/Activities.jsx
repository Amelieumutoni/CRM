import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getActivities, createActivity, getCompanies, getContacts, getDeals } from '../api';
import ActivityItem from '../components/ActivityItem';
import Modal from '../components/Modal';
import { ACT_TYPES, today, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const EMPTY = { type:'Call', title:'', companyId:'', contactId:'', dealId:'', notes:'', date: today(), completed: false };

export default function Activities() {
  const { data: activities, loading, refetch } = useApi(getActivities);
  const { data: companies } = useApi(getCompanies);
  const { data: contacts  } = useApi(getContacts);
  const { data: deals     } = useApi(getDeals);
  const [tab,       setTab]       = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const { showToast } = useApp();

  const set = k => e => setForm(p => ({
    ...p, [k]: e.target.value,
    ...(k === 'companyId' ? { contactId:'', dealId:'' } : {}),
  }));

  const filtered = (activities||[]).filter(a => tab === 'upcoming' ? !a.completed : a.completed);
  const companyContacts = (contacts||[]).filter(c => c.companyId === form.companyId);
  const companyDeals    = (deals||[]).filter(d => id(d.companyId) === form.companyId);

  async function handleCreate(e) {
    e.preventDefault(); if (!form.title) return; setSaving(true);
    try { await createActivity(form); refetch(); showToast('Activity logged'); setShowModal(false); setForm(EMPTY); }
    catch { showToast('Failed to log'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>Activities</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log activity</button>
      </div>

      <div className="pills mb20">
        {['upcoming','completed'].map(t => (
          <button key={t} className={'pill' + (tab === t ? ' on' : '')} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
            {t} {tab === t && `(${filtered.length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="muted f13">Loading…</div> : (
        <>
          {filtered.length === 0 && <div className="f13 dim" style={{ padding:'20px 0' }}>No {tab} activities.</div>}
          {filtered.map(a => <ActivityItem key={id(a)} activity={a} onRefetch={refetch} />)}
        </>
      )}

      {showModal && (
        <Modal title="Log activity" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
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
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Log activity'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}