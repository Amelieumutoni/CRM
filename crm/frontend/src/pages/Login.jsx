import { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem('crm_token', res.data.token);
      localStorage.setItem('crm_user',  JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg3)',
    }}>
      <div style={{
        background:'var(--bg)', border:'0.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'36px 40px',
        width:'100%', maxWidth:380,
      }}>
        {/* Logo */}
        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div style={{ fontSize:15, fontWeight:600, letterSpacing:'-.02em' }}>eFiche CRM</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{
            background:'#FCEBEB', color:'#A32D2D', border:'1px solid #F09595',
            borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Email</label>
            <input
              className="finput"
              type="email"
              placeholder="you@efiche.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="fg">
            <label>Password</label>
            <input
              className="finput"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:'10px', marginTop:8 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
