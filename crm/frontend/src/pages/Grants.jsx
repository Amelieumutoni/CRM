import { useState } from 'react';
import { useApi }   from '../hooks/useApi';
import { useApp }   from '../context/AppContext';
import { getGrants, getGrantStats, createGrant, updateGrant, deleteGrant, getContacts } from '../api';
import Modal  from '../components/Modal';
import { formatCurrency, formatDate, id } from '../utils/helpers';

const STAGES = ['Identifying','Drafting','Submitted','Under Review','Approved','Rejected'];

const STAGE_COLORS = {
  Identifying:    { bg:'#F0F4FF', text:'#3451B2', border:'#6B8CFF' },
  Drafting:       { bg:'#FAEEDA', text:'#854F0B', border:'#EF9F27' },
  Submitted:      { bg:'#EEEDFE', text:'#534AB7', border:'#7F77DD' },
  'Under Review': { bg:'#E6F1FB', text:'#185FA5', border:'#378ADD' },
  Approved:       { bg:'#EAF3DE', text:'#3B6D11', border:'#639922' },
  Rejected:       { bg:'#FCEBEB', text:'#A32D2D', border:'#E24B4A' },
};

const EMPTY = {
  name:'', funder:'', amount:'', stage:'Identifying',
  deadline:'', decisionDate:'', contactId:'', notes:''
};

function isUrgent(deadline) {
  if (!deadline) return false;
  const diff = new Date(deadline) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function Grants() {
  const { data: grants  = [], loading, refetch } = useApi(getGrants, []);
  const { data: rawStats } = useApi(getGrantStats, []);
  const stats = rawStats || {};
  const { data: contacts = [] }                  = useApi(getContacts, []);
  const { showToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setForm(EMPTY); setEditTarget(null); setShowModal(true); }
  function openEdit(g)  { setForm({ ...g, amount: g.amount||'', deadline: g.deadline ? g.deadline.split('T')[0] : '', decisionDate: g.decisionDate ? g.decisionDate.split('T')[0] : '', contactId: g.contactId ? id(g.contactId) : '' }); setEditTarget(g); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.funder) return;
    setSaving(true);
    try {
      if (editTarget) { await updateGrant(id(editTarget), { ...form, amount: Number(form.amount)||0 }); showToast('Grant updated'); }
      else            { await createGrant({ ...form, amount: Number(form.amount)||0 });                 showToast('Grant added'); }
      refetch(); setShowModal(false);
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(g) {
    if (!window.confirm('Delete this grant?')) return;
    try { await deleteGrant(id(g)); refetch(); showToast('Grant deleted'); }
    catch { showToast('Failed to delete'); }
  }

  async function moveStage(g, newStage) {
    try { await updateGrant(id(g), { stage: newStage }); refetch(); showToast(`Moved to ${newStage}`); }
    catch { showToast('Failed to update stage'); }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-hdr">
        <h1>Grants</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New grant</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        <StatCard label="Total Grants"      value={stats.total || 0}                        sub="all time" />
        <StatCard label="Active"            value={stats.activeCount || 0}                  sub="in progress" />
        <StatCard label="Total Applied"     value={formatCurrency(stats.totalAmount || 0)}  sub="across all grants" />
        <StatCard label="Success Rate"      value={`${stats.successRate || 0}%`}            sub={`${stats.approvedCount||0} approved`} />
      </div>

      {/* Kanban board */}
      {loading ? <div className="muted f13">Loading…</div> : (
        <div className="pipeline-board">
          {STAGES.map(stage => {
            const col = grants.filter(g => g.stage === stage);
            const colValue = col.reduce((s, g) => s + (g.amount||0), 0);
            const colors = STAGE_COLORS[stage];
            return (
              <div key={stage} className="p-col">
                <div className="p-col-hdr" style={{ background: colors.bg, border:`1px solid ${colors.border}` }}>
                  <span style={{ fontSize:12, fontWeight:500, color: colors.text }}>{stage}</span>
                  <span style={{ fontSize:11, color: colors.text, opacity:.8 }}>{col.length}</span>
                </div>
                <div className="p-col-val">{colValue > 0 ? formatCurrency(colValue) : ''}</div>

                {col.length === 0 && (
                  <div className="k-empty">No grants</div>
                )}

                {col.map(g => {
                  const urgent  = isUrgent(g.deadline);
                  const overdue = isOverdue(g.deadline);
                  return (
                    <div key={id(g)} className="deal-card">
                      {/* Grant name */}
                      <div className="fw5 f13" style={{ marginBottom:4 }}>{g.name}</div>
                      {/* Funder */}
                      <div className="muted f12" style={{ marginBottom:8 }}>{g.funder}</div>

                      {/* Amount */}
                      {g.amount > 0 && (
                        <div className="f12 fw5" style={{ marginBottom:6 }}>{formatCurrency(g.amount)}</div>
                      )}

                      {/* Deadline */}
                      {g.deadline && (
                        <div style={{ fontSize:11, marginBottom:6,
                          color: overdue ? '#A32D2D' : urgent ? '#854F0B' : 'var(--text3)' }}>
                          {overdue ? '⚠ Overdue · ' : urgent ? '🔔 Due soon · ' : '📅 '}
                          {formatDate(g.deadline)}
                        </div>
                      )}

                      {/* Contact */}
                      {g.contactId && (
                        <div className="dim f11" style={{ marginBottom:8 }}>
                          👤 {g.contactId.firstName} {g.contactId.lastName}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="row gap4" style={{ marginTop:8, flexWrap:'wrap' }}>
                        <button className="btn btn-sm btn-ghost" style={{ fontSize:11, padding:'3px 8px' }} onClick={() => openEdit(g)}>Edit</button>
                        <button className="btn btn-sm btn-danger" style={{ fontSize:11, padding:'3px 8px' }} onClick={() => handleDelete(g)}>✕</button>
                      </div>

                      {/* Move stage */}
                      <div style={{ marginTop:8 }}>
                        <select
                          className="fselect"
                          style={{ fontSize:11, padding:'3px 6px' }}
                          value={g.stage}
                          onChange={e => moveStage(g, e.target.value)}
                        >
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editTarget ? 'Edit grant' : 'New grant'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="fg">
              <label>Grant name <span className="req">*</span></label>
              <input className="finput" value={form.name} onChange={set('name')} placeholder="e.g. Global Health Innovation Fund" required />
            </div>
            <div className="fg">
              <label>Funder / Organization <span className="req">*</span></label>
              <input className="finput" value={form.funder} onChange={set('funder')} placeholder="e.g. Bill & Melinda Gates Foundation" required />
            </div>
            <div className="grid2">
              <div className="fg">
                <label>Amount (USD)</label>
                <input className="finput" type="number" value={form.amount} onChange={set('amount')} placeholder="0" />
              </div>
              <div className="fg">
                <label>Stage</label>
                <select className="fselect" value={form.stage} onChange={set('stage')}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid2">
              <div className="fg">
                <label>Application Deadline</label>
                <input className="finput" type="date" value={form.deadline} onChange={set('deadline')} />
              </div>
              <div className="fg">
                <label>Expected Decision</label>
                <input className="finput" type="date" value={form.decisionDate} onChange={set('decisionDate')} />
              </div>
            </div>
            <div className="fg">
              <label>Contact Person</label>
              <select className="fselect" value={form.contactId} onChange={set('contactId')}>
                <option value="">— Select contact —</option>
                {contacts.map(c => <option key={id(c)} value={id(c)}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Notes</label>
              <textarea className="ftextarea" value={form.notes} onChange={set('notes')} placeholder="Requirements, links, key details…" />
            </div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Add grant'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}