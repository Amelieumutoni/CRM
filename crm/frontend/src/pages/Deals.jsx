import { getCurrentUser } from '../components/UserPicker';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDeals, createDeal, getCompanies, getContacts } from '../api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, STAGES, today, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const EMPTY = { title:'', companyId:'', contactId:'', value:'', stage:'Prospecting', probability:20, closeDate:'', priority:'Medium', notes:'' };

export default function Deals() {
  const { data: deals,    loading, refetch } = useApi(getDeals);
  const { data: companies } = useApi(getCompanies);
  const { data: contacts  } = useApi(getContacts);
  const [search,    setSearch]    = useState('');
  const [stageFlt,  setStageFlt]  = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const nav = useNavigate();
  const { showToast } = useApp();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = (deals || []).filter(d => {
    if (stageFlt !== 'All' && d.stage !== stageFlt) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || (d.companyId?.name || '').toLowerCase().includes(q);
  });

  const companyContacts = (contacts || []).filter(c => c.companyId === form.companyId);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const res = await createDeal({ ...form, value: Number(form.value) || 0 });
      refetch(); showToast('Deal created'); setShowModal(false); setForm(EMPTY);
      nav(`/deals/${res.data._id}`);
    } catch { showToast('Failed to create deal'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>Deals</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New deal</button>
      </div>

      <div className="row gap8 mb16" style={{ flexWrap:'wrap' }}>
        <input className="search-input" placeholder="Search deals…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="pills">
          {['All', ...STAGES].map(s => (
            <button key={s} className={'pill' + (stageFlt === s ? ' on' : '')} onClick={() => setStageFlt(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="muted f13">Loading…</div> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>{['Deal','Company','Value','Stage','Close date','Priority',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:24, color:'var(--text3)' }}>No deals found</td></tr>}
              {filtered.map(d => (
                <tr key={id(d)} className="clickrow" onClick={() => nav(`/deals/${id(d)}`)}>
                  <td className="fw5">{d.title}</td>
                  <td className="muted">{d.companyId?.name || '—'}</td>
                  <td className="fw5">{formatCurrency(d.value)}</td>
                  <td><Badge label={d.stage} /></td>
                  <td className="muted">{formatDate(d.closeDate)}</td>
                  <td><Badge label={d.priority} type="priority" /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm" onClick={() => nav(`/deals/${id(d)}`)}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="New deal" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="fg"><label>Deal title <span className="req">*</span></label>
              <input className="finput" value={form.title} onChange={set('title')} placeholder="e.g. Enterprise License 2024" required /></div>
            <div className="grid2">
              <div className="fg"><label>Company</label>
                <select className="fselect" value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value, contactId: '' }))}>
                  <option value="">— Select —</option>
                  {(companies || []).map(c => <option key={id(c)} value={id(c)}>{c.name}</option>)}
                </select></div>
              <div className="fg"><label>Contact</label>
                <select className="fselect" value={form.contactId} onChange={set('contactId')}>
                  <option value="">— Select —</option>
                  {companyContacts.map(c => <option key={id(c)} value={id(c)}>{c.firstName} {c.lastName}</option>)}
                </select></div>
            </div>
            <div className="grid3">
              <div className="fg"><label>Value ($)</label><input className="finput" type="number" value={form.value} onChange={set('value')} /></div>
              <div className="fg"><label>Stage</label>
                <select className="fselect" value={form.stage} onChange={set('stage')}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="fg"><label>Priority</label>
                <select className="fselect" value={form.priority} onChange={set('priority')}>
                  {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}</select></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Close date</label><input className="finput" type="date" value={form.closeDate} onChange={set('closeDate')} /></div>
              <div className="fg"><label>Probability: {form.probability}%</label>
                <input type="range" min={0} max={100} step={5} value={form.probability} onChange={e => setForm(p => ({ ...p, probability: Number(e.target.value) }))} style={{ width:'100%', marginTop:8 }} /></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={form.notes} onChange={set('notes')} placeholder="Key details, blockers, next steps…" /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Create deal'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}