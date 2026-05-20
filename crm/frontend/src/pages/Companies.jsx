import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getCompanies, createCompany } from '../api';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { formatCurrency, INDUSTRIES, SIZES, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const EMPTY = { name:'', industry:'SaaS', size:'50-200', website:'', status:'Active', notes:'' };

export default function Companies() {
  const { data: companies, loading, refetch } = useApi(getCompanies);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const nav = useNavigate();
  const { showToast } = useApp();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = (companies || []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault(); if (!form.name) return; setSaving(true);
    try {
      const res = await createCompany(form);
      refetch(); showToast('Company added'); setShowModal(false); setForm(EMPTY);
      nav(`/companies/${res.data._id}`);
    } catch { showToast('Failed to create company'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>Companies</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add company</button>
      </div>
      <input className="search-input mb16" placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? <div className="muted f13">Loading…</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:14 }}>
          {filtered.map(co => (
            <div key={id(co)} className="card card-click" onClick={() => nav(`/companies/${id(co)}`)}>
              <div className="row gap12 mb12">
                <Avatar name={co.name} size={40} />
                <div><div className="fw5 f14">{co.name}</div><div className="f12 muted">{co.industry} · {co.size}</div></div>
              </div>
              <div style={{ display:'flex', gap:16 }}>
                <div style={{ textAlign:'center' }}><div className="fw5" style={{ fontSize:16 }}>{co.contactCount || 0}</div><div className="f10 dim">contacts</div></div>
                <div style={{ textAlign:'center' }}><div className="fw5" style={{ fontSize:16 }}>{co.dealCount || 0}</div><div className="f10 dim">deals</div></div>
                <div style={{ textAlign:'center' }}><div className="fw5 f13">{formatCurrency(co.pipelineValue || 0)}</div><div className="f10 dim">pipeline</div></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="f13 dim">No companies found.</div>}
        </div>
      )}

      {showModal && (
        <Modal title="Add company" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="fg"><label>Company name <span className="req">*</span></label><input className="finput" value={form.name} onChange={set('name')} required /></div>
            <div className="grid2">
              <div className="fg"><label>Industry</label><select className="fselect" value={form.industry} onChange={set('industry')}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
              <div className="fg"><label>Size</label><select className="fselect" value={form.size} onChange={set('size')}>{SIZES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Website</label><input className="finput" value={form.website} onChange={set('website')} placeholder="company.com" /></div>
              <div className="fg"><label>Status</label><select className="fselect" value={form.status} onChange={set('status')}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={form.notes} onChange={set('notes')} /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Add company'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}