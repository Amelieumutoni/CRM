import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getDeal, updateDeal, deleteDeal, createActivity, getContacts } from '../api';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import ActivityItem from '../components/ActivityItem';
import { formatCurrency, formatDate, STAGES, STAGE_COLORS, ACT_TYPES, today, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const ACT_EMPTY = { type:'Call', title:'', contactId:'', notes:'', date: today(), completed: false };

export default function DealDetail() {
  const { id: dealId } = useParams();
  const nav = useNavigate();
  const { showToast } = useApp();
  const { data: deal, loading, refetch } = useApi(() => getDeal(dealId), [dealId]);
  const { data: contacts } = useApi(getContacts);

  const [editModal, setEditModal] = useState(false);
  const [actModal,  setActModal]  = useState(false);
  const [form,      setForm]      = useState({});
  const [actForm,   setActForm]   = useState(ACT_EMPTY);
  const [saving,    setSaving]    = useState(false);

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setA = k => e => setActForm(p => ({ ...p, [k]: e.target.value }));

  async function handleUpdate(e) {
    e.preventDefault(); setSaving(true);
    try {
      await updateDeal(dealId, { ...form, value: Number(form.value), companyId: id(deal.companyId), contactId: id(deal.contactId) });
      refetch(); showToast('Deal updated'); setEditModal(false);
    } catch { showToast('Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this deal?')) return;
    try { await deleteDeal(dealId); nav('/deals'); showToast('Deal deleted'); }
    catch { showToast('Failed to delete'); }
  }

  async function handleStage(stage) {
    try { await updateDeal(dealId, { ...deal, stage, companyId: id(deal.companyId), contactId: id(deal.contactId) }); refetch(); showToast(`Moved to ${stage}`); }
    catch { showToast('Failed'); }
  }

  async function handleAddActivity(e) {
    e.preventDefault(); setSaving(true);
    try {
      await createActivity({ ...actForm, dealId: dealId, companyId: id(deal.companyId) });
      refetch(); showToast('Activity logged'); setActModal(false); setActForm(ACT_EMPTY);
    } catch { showToast('Failed to log activity'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="muted f13">Loading…</div>;
  if (!deal)   return <div className="muted f13">Deal not found.</div>;

  const co = deal.companyId;
  const ct = deal.contactId;
  const dealContacts = (contacts || []).filter(c => c.companyId === id(co));

  return (
    <div>
      <div className="detail-actions">
        <button className="btn btn-sm" onClick={() => nav('/deals')}>← Back</button>
        <div className="spacer" />
        <button className="btn btn-sm" onClick={() => setActModal(true)}>+ Log activity</button>
        <button className="btn btn-sm" onClick={() => { setForm({ ...deal, value: deal.value, closeDate: deal.closeDate ? deal.closeDate.split('T')[0] : '' }); setEditModal(true); }}>Edit deal</button>
        <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
      </div>

      <h1 style={{ marginBottom: 8 }}>{deal.title}</h1>
      <div className="row gap8 mb20"><Badge label={deal.stage} /><Badge label={deal.priority} type="priority" /></div>

      <div className="detail-grid">
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <StatCard label="Deal value"  value={formatCurrency(deal.value)} />
            <StatCard label="Probability" value={`${deal.probability}%`} />
            <StatCard label="Close date"  value={formatDate(deal.closeDate)} />
          </div>
          {deal.notes && <div className="card mb20"><div className="f12 muted mb4">Notes</div><div className="f13">{deal.notes}</div></div>}

          <div className="row-between mb12">
            <div className="section-title" style={{ margin:0 }}>Activity history</div>
            <button className="btn btn-sm" onClick={() => setActModal(true)}>+ Add</button>
          </div>
          {(!deal.activities || deal.activities.length === 0) && <div className="f13 dim">No activities yet.</div>}
          {(deal.activities || []).map(a => <ActivityItem key={id(a)} activity={a} onRefetch={refetch} />)}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {co && (
            <div className="card">
              <div className="f11 muted mb10" style={{ textTransform:'uppercase', letterSpacing:'.05em' }}>Company</div>
              <div className="row gap12 mb8">
                <Avatar name={co.name || '?'} size={38} />
                <div>
                  <div className="fw5 f14 link" onClick={() => nav(`/companies/${id(co)}`)}>{co.name}</div>
                  <div className="f12 muted">{co.industry}</div>
                </div>
              </div>
              {co.website && <div className="f12 dim">🌐 {co.website}</div>}
            </div>
          )}
          {ct && (
            <div className="card">
              <div className="f11 muted mb10" style={{ textTransform:'uppercase', letterSpacing:'.05em' }}>Primary contact</div>
              <div className="row gap10 mb8">
                <Avatar name={`${ct.firstName} ${ct.lastName}`} size={36} />
                <div>
                  <div className="fw5 f13">{ct.firstName} {ct.lastName}</div>
                  <div className="f12 muted">{ct.title}</div>
                </div>
              </div>
              {ct.email && <div className="f12 dim mb2">✉ {ct.email}</div>}
              {ct.phone && <div className="f12 dim">📞 {ct.phone}</div>}
            </div>
          )}
          <div className="card">
            <div className="f11 muted mb10" style={{ textTransform:'uppercase', letterSpacing:'.05em' }}>Move stage</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {STAGES.map(s => {
                const sc = STAGE_COLORS[s] || {};
                const active = deal.stage === s;
                return (
                  <button key={s} onClick={() => handleStage(s)} style={{
                    padding:'7px 12px', borderRadius:8, textAlign:'left', cursor:'pointer',
                    border:`1px solid ${sc.border}`, fontFamily:'inherit', fontSize:12,
                    background: active ? sc.bg : 'transparent', color: active ? sc.text : 'var(--text2)', fontWeight: active ? 500 : 400,
                  }}>
                    {active && '→ '}{s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {editModal && (
        <Modal title="Edit deal" onClose={() => setEditModal(false)}>
          <form onSubmit={handleUpdate}>
            <div className="fg"><label>Title <span className="req">*</span></label><input className="finput" value={form.title || ''} onChange={set('title')} required /></div>
            <div className="grid3">
              <div className="fg"><label>Value ($)</label><input className="finput" type="number" value={form.value || ''} onChange={set('value')} /></div>
              <div className="fg"><label>Stage</label><select className="fselect" value={form.stage || ''} onChange={set('stage')}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="fg"><label>Priority</label><select className="fselect" value={form.priority || ''} onChange={set('priority')}>{['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}</select></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Close date</label><input className="finput" type="date" value={form.closeDate || ''} onChange={set('closeDate')} /></div>
              <div className="fg"><label>Probability: {form.probability}%</label>
                <input type="range" min={0} max={100} step={5} value={form.probability || 0} onChange={e => setForm(p => ({ ...p, probability: Number(e.target.value) }))} style={{ width:'100%', marginTop:8 }} /></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={form.notes || ''} onChange={set('notes')} /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {actModal && (
        <Modal title="Log activity" onClose={() => setActModal(false)}>
          <form onSubmit={handleAddActivity}>
            <div className="grid2">
              <div className="fg"><label>Type</label><select className="fselect" value={actForm.type} onChange={setA('type')}>{ACT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label>Date</label><input className="finput" type="date" value={actForm.date} onChange={setA('date')} /></div>
            </div>
            <div className="fg"><label>Title <span className="req">*</span></label><input className="finput" value={actForm.title} onChange={setA('title')} placeholder="e.g. Follow-up call" required /></div>
            <div className="fg"><label>Contact</label>
              <select className="fselect" value={actForm.contactId} onChange={setA('contactId')}>
                <option value="">— Select —</option>
                {dealContacts.map(c => <option key={id(c)} value={id(c)}>{c.firstName} {c.lastName}</option>)}
              </select></div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={actForm.notes} onChange={setA('notes')} placeholder="Key takeaways, next steps…" /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setActModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Log activity'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}