import { useState } from 'react';

const DEFAULT_USERS = ['Amelie', 'Daniella'];
const STORAGE_KEY   = 'crm_current_user';
const USERS_KEY     = 'crm_team_users';

export function getCurrentUser() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function getUserList() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
}

export default function UserPicker({ onSelect }) {
  const [users, setUsers]     = useState(getUserList());
  const [adding, setAdding]   = useState(false);
  const [newName, setNewName] = useState('');

  function pick(name) {
    localStorage.setItem(STORAGE_KEY, name);
    onSelect(name);
  }

  function addName() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = [...users, trimmed];
    setUsers(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    setNewName('');
    setAdding(false);
    pick(trimmed);
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999
    }}>
      <div style={{
        background:'var(--bg)', borderRadius:'var(--radius-lg)',
        border:'0.5px solid var(--border)', padding:'32px 36px',
        width:'100%', maxWidth:380, textAlign:'center'
      }}>
        <div style={{ fontSize:28, marginBottom:8 }}>👋</div>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>Welcome to SalesCRM</h2>
        <p className="muted f13" style={{ marginBottom:24 }}>Who are you? We'll track your activity.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
          {users.map(name => (
            <button key={name} className="btn" onClick={() => pick(name)} style={{
              padding:'12px', fontSize:14, fontWeight:500,
              justifyContent:'center', borderRadius:'var(--radius)',
            }}>
              {name}
            </button>
          ))}
        </div>

        {adding ? (
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input
              className="finput"
              placeholder="Enter name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addName()}
              autoFocus
            />
            <button className="btn btn-primary" onClick={addName}>Add</button>
            <button className="btn" onClick={() => setAdding(false)}>✕</button>
          </div>
        ) : (
          <button className="btn btn-ghost" style={{ fontSize:12, color:'var(--text3)', width:'100%' }}
            onClick={() => setAdding(true)}>
            + Add new name
          </button>
        )}
      </div>
    </div>
  );
}