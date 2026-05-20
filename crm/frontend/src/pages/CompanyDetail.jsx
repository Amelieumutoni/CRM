import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getCompany, updateCompany, deleteCompany, createContact } from '../api';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ActivityItem from '../components/ActivityItem';
import { formatCurrency, INDUSTRIES, SIZES, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const CT_EMPTY = { firstName:'', lastName:'', title:'', email:'', phone:'', linkedin:'' };

export default function CompanyDetail() {
  const { id: coId } = useParams();
  const nav = useNavigate();
  const { showToast } = useApp();
  const { data: co, loading, refetch } = useApi(() => getCompany(coId), [coId]);
  const [editModal, setEditModal] = useState(false);
  const [ctModal,   setCtModal]   = useState(false);
  const [form,      setForm]      = useState({});
  const [ctForm,    setCtForm]    = useState(CT_EMPTY);
  const [saving,    setSaving]    = useState(false);
  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setC = k => e => setCtForm(p => ({ ...p, [k]: e.target.value }));

  async function handleUpdate(e) {
    e.preventDefault(); setSaving(true);
    try { await updateCompany(coId, form); refetch(); showToast('Company updated'); setEditModal(false); }
    catch { showToast('Failed to update'); }
    finally { setSaving(false); }
  }
  async function handleDelete() {
    if (!window.confirm('Delete this company?')) return;
    try { await deleteCompany(coId); nav('/companies'); showToast('Deleted'); }
    catch { showToast('Failed to delete'); }
  }
  async function handleAddContact(e) {
    e.preventDefault(); if (!ctForm.firstName || !ctForm.lastName) return; setSaving(true);
    try { await createContact({ ...ctForm, companyId: coId }); refetch(); showToast('Contact added'); setCtModal(false); setCtForm(CT_EMPTY); }
    catch { showToast('Failed to add contact'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="muted f13">Loading…</div>;
  if (!co) return <div className="muted f13">Company not found.</div>;

  return (
    <div>
      <div className="detail-actions">
        <button className="btn btn-sm" onClick={() => nav('/companies')}>← Back</button>
        <div className="spacer" />
        <button className="btn btn-sm" onClick={() => setCtModal(true)}>+ Add contact</button>
        <button className="btn btn-sm" onClick={() => { setForm({ name:co.name, industry:co.industry, size:co.size, website:co.website, status:co.status, notes:co.notes }); setEditModal(true); }}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
      </div>

      <div className="row gap16 mb20">
        <Avatar name={co.name} size={52} />
        <div>
          <h1 style={{ margin:'0 0 4px' }}>{co.name}</h1>
          <div className="f13 muted">{co.industry} · {co.size}{co.website ? ` · ${co.website}` : ''}</div>
        </div>
        <div style={{ marginLeft:'auto' }}>
          <span className={`badge ${co.status === 'Active' ? 's-Qualified' : 's-Closed-Lost'}`}>{co.status}</span>
        </div>
      </div>

      {co.notes && <div className="card mb20"><div className="f12 muted mb4">Notes</div><div className="f13">{co.notes}</div></div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div>
          <div className="section-title">Contacts ({(co.contacts||[]).length})</div>
          {(co.contacts||[]).map(ct => (
            <div key={id(ct)} className="card mb10">
              <div className="row gap10">
                <Avatar name={`${ct.firstName} ${ct.lastName}`} size={34} />
                <div style={{ flex:1 }}>
                  <div className="fw5 f13">{ct.firstName} {ct.lastName}</div>
                  <div className="f12 muted">{ct.title}</div>
                  {ct.email && <div className="f11 dim">{ct.email}</div>}
                </div>
              </div>
            </div>
          ))}
          {(co.contacts||[]).length === 0 && <div className="f13 dim">No contacts yet.</div>}
        </div>
        <div>
          <div className="section-title">Deals ({(co.deals||[]).length})</div>
          {(co.deals||[]).map(d => (
            <div key={id(d)} className="card card-click mb10" onClick={() => nav(`/deals/${id(d)}`)}>
              <div className="row-between">
                <div><div className="fw5 f13 mb4">{d.title}</div><Badge label={d.stage} /></div>
                <div className="fw5 f14">{formatCurrency(d.value)}</div>
              </div>
            </div>
          ))}
          {(co.deals||[]).length === 0 && <div className="f13 dim">No deals yet.</div>}
        </div>
      </div>

      <div className="mt20">
        <div className="section-title">Recent activity</div>
        {(co.activities||[]).slice(0,8).map(a => <ActivityItem key={id(a)} activity={a} onRefetch={refetch} />)}
        {(co.activities||[]).length === 0 && <div className="f13 dim">No activities yet.</div>}
      </div>

      {editModal && (
        <Modal title="Edit company" onClose={() => setEditModal(false)}>
          <form onSubmit={handleUpdate}>
            <div className="fg"><label>Name <span className="req">*</span></label><input className="finput" value={form.name||''} onChange={set('name')} required /></div>
            <div className="grid2">
              <div className="fg"><label>Industry</label><select className="fselect" value={form.industry||''} onChange={set('industry')}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
              <div className="fg"><label>Size</label><select className="fselect" value={form.size||''} onChange={set('size')}>{SIZES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Website</label><input className="finput" value={form.website||''} onChange={set('website')} /></div>
              <div className="fg"><label>Status</label><select className="fselect" value={form.status||'Active'} onChange={set('status')}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="ftextarea" value={form.notes||''} onChange={set('notes')} /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </Modal>
      )}
      {ctModal && (
        <Modal title="Add contact" onClose={() => setCtModal(false)}>
          <form onSubmit={handleAddContact}>
            <div className="grid2">
              <div className="fg"><label>First name <span className="req">*</span></label><input className="finput" value={ctForm.firstName} onChange={setC('firstName')} required /></div>
              <div className="fg"><label>Last name <span className="req">*</span></label><input className="finput" value={ctForm.lastName} onChange={setC('lastName')} required /></div>
            </div>
            <div className="fg"><label>Title</label><input className="finput" value={ctForm.title} onChange={setC('title')} placeholder="VP of Sales" /></div>
            <div className="grid2">
              <div className="fg"><label>Email</label><input className="finput" type="email" value={ctForm.email} onChange={setC('email')} /></div>
              <div className="fg"><label>Phone</label><input className="finput" value={ctForm.phone} onChange={setC('phone')} /></div>
            </div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setCtModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Add contact'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}