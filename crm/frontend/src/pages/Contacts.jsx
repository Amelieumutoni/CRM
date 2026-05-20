import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getContacts, getCompanies, createContact, updateContact, deleteContact } from '../api';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const EMPTY = { firstName:'', lastName:'', title:'', email:'', phone:'', companyId:'', linkedin:'' };

const MMI_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPQBtXqHGroaV3f4_EdkAtTMx3jOO3EeMWxquUJ9r25s3DXmUihtBgm-Wriw8e7vbGpP_ZrJe3rFCi/pubhtml?widget=true&headers=false';

export default function Contacts() {
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'mmi'
  const { data: contacts, loading, refetch } = useApi(getContacts);
  const { data: companies } = useApi(getCompanies);
  const [search,     setSearch]     = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const nav = useNavigate();
  const { showToast } = useApp();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = (contacts || []).filter(c =>
    !search || `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.title||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName||'').toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setForm(EMPTY); setEditTarget(null); setShowModal(true); }
  function openEdit(ct) { setForm({ firstName:ct.firstName, lastName:ct.lastName, title:ct.title||'', email:ct.email||'', phone:ct.phone||'', companyId: ct.companyId||'', linkedin:ct.linkedin||'' }); setEditTarget(ct); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault(); if (!form.firstName || !form.lastName) return; setSaving(true);
    try {
      if (editTarget) { await updateContact(id(editTarget), form); showToast('Contact updated'); }
      else            { await createContact(form);                  showToast('Contact added'); }
      refetch(); setShowModal(false);
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(ct) {
    if (!window.confirm('Delete this contact?')) return;
    try { await deleteContact(id(ct)); refetch(); showToast('Contact deleted'); }
    catch { showToast('Failed to delete'); }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>Contacts</h1>
        {activeTab === 'contacts' && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add contact</button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', borderBottom:'0.5px solid var(--border)', marginBottom:20 }}>
        {[['contacts','Contacts'],['mmi','MMI List']].map(([key,label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding:'8px 18px', fontSize:13, background:'none', border:'none',
            borderBottom: activeTab === key ? '2px solid var(--text)' : '2px solid transparent',
            color: activeTab === key ? 'var(--text)' : 'var(--text2)',
            fontWeight: activeTab === key ? 500 : 400,
            cursor:'pointer', marginBottom:-1, transition:'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* MMI List tab */}
      {activeTab === 'mmi' && (
        <div>
          <div className="row-between mb12">
            <p className="muted f13">Live view of your MMI Google Sheet</p>
            <a href={MMI_SHEET_URL} target="_blank" rel="noreferrer" className="btn btn-sm">&#8599; Open in Google Sheets</a>
          </div>
          <div style={{ border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <iframe
              src={MMI_SHEET_URL}
              title="MMI List"
              style={{ width:'100%', height:'calc(100vh - 250px)', minHeight:480, border:'none', display:'block' }}
            />
          </div>
          <p className="dim f12" style={{ marginTop:10 }}>Changes made in Google Sheets appear here automatically.</p>
        </div>
      )}

      {/* Contacts tab */}
      {activeTab === 'contacts' && <>
      <input className="search-input mb16" placeholder="Search contacts…" value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? <div className="muted f13">Loading…</div> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>{['Name','Title','Company','Email','Phone',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--text3)' }}>No contacts found</td></tr>}
              {filtered.map(ct => (
                <tr key={id(ct)}>
                  <td><div className="row gap10"><Avatar name={`${ct.firstName} ${ct.lastName}`} size={30} /><span className="fw5">{ct.firstName} {ct.lastName}</span></div></td>
                  <td className="muted">{ct.title}</td>
                  <td><span className="link" onClick={() => nav(`/companies/${ct.companyId}`)}>{ct.companyName}</span></td>
                  <td className="dim f12">{ct.email}</td>
                  <td className="dim f12">{ct.phone}</td>
                  <td><div className="row gap8">
                    <button className="btn btn-sm" onClick={() => openEdit(ct)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ct)}>✕</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      </>}

      {showModal && (
        <Modal title={editTarget ? 'Edit contact' : 'Add contact'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="grid2">
              <div className="fg"><label>First name <span className="req">*</span></label><input className="finput" value={form.firstName} onChange={set('firstName')} required /></div>
              <div className="fg"><label>Last name <span className="req">*</span></label><input className="finput" value={form.lastName} onChange={set('lastName')} required /></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Title</label><input className="finput" value={form.title||''} onChange={set('title')} placeholder="VP of Sales" /></div>
              <div className="fg"><label>Company</label>
                <select className="fselect" value={form.companyId||''} onChange={set('companyId')}>
                  <option value="">— Select —</option>
                  {(companies||[]).map(c => <option key={id(c)} value={id(c)}>{c.name}</option>)}
                </select></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Email</label><input className="finput" type="email" value={form.email||''} onChange={set('email')} /></div>
              <div className="fg"><label>Phone</label><input className="finput" value={form.phone||''} onChange={set('phone')} /></div>
            </div>
            <div className="fg"><label>LinkedIn</label><input className="finput" value={form.linkedin||''} onChange={set('linkedin')} placeholder="linkedin.com/in/name" /></div>
            <div className="row-between mt8">
              <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : (editTarget ? 'Save changes' : 'Add contact')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}