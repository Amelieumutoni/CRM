import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashStats, getDashUpcoming, toggleActivity } from '../api';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate, STAGE_COLORS, isOverdue, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function Dashboard({ onStats }) {
  const [stats,    setStats]    = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const nav = useNavigate();
  const { showToast } = useApp();

  async function load() {
    try {
      const [s, u] = await Promise.all([getDashStats(), getDashUpcoming()]);
      setStats(s.data);
      setUpcoming(u.data);
      onStats?.(s.data);
    } catch { showToast('Failed to load dashboard'); }
  }
  useEffect(() => { load(); }, []);

  async function toggle(actId) {
    try { await toggleActivity(actId); load(); } catch { showToast('Failed to update'); }
  }

  if (!stats) return <div className="muted f13">Loading…</div>;

  const maxVal = Math.max(...(stats.byStage || []).map(s => s.value), 1);

  return (
    <div>
      <div className="page-hdr">
        <h1>Dashboard</h1>
        <button className="btn btn-primary btn-sm" onClick={() => nav('/deals')}>+ New deal</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        <StatCard label="Pipeline value"    value={formatCurrency(stats.pipelineValue)}  sub={`${stats.openDeals} open deals`} />
        <StatCard label="Weighted forecast" value={formatCurrency(stats.weightedValue)}  sub="By probability" />
        <StatCard label="Closed won"        value={formatCurrency(stats.wonValue)}        sub={`${stats.wonDeals} deals`} color="#3B6D11" />
        <StatCard label="Overdue tasks"     value={stats.overdueCount}                   color={stats.overdueCount > 0 ? '#A32D2D' : undefined} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card">
          <div className="f13 fw5 muted mb16">Pipeline by stage</div>
          {(stats.byStage || []).map(({ stage, count, value }) => {
            const sc = STAGE_COLORS[stage] || {};
            return (
              <div key={stage} style={{ marginBottom:12 }}>
                <div className="row-between mb4">
                  <span className="f12">{stage}</span>
                  <span className="f11 muted">{count} deal{count !== 1 ? 's' : ''} · {formatCurrency(value)}</span>
                </div>
                <div className="prog-wrap">
                  <div className="prog-bar" style={{ width:`${(value/maxVal)*100}%`, background: sc.border || '#888' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="row-between mb16">
            <div className="f13 fw5 muted">Upcoming tasks</div>
            <button className="btn btn-sm" onClick={() => nav('/activities')}>View all →</button>
          </div>
          {upcoming.length === 0 && <div className="f13 dim" style={{ textAlign:'center', padding:'20px 0' }}>No pending tasks 🎉</div>}
          {upcoming.slice(0, 7).map(a => (
            <div key={id(a)} className="row gap8" style={{ padding:'7px 0', borderBottom:'0.5px solid var(--border)' }}>
              <div className={'chk' + (a.completed ? ' on' : '')} onClick={() => toggle(id(a))}>
                {a.completed && <span style={{ fontSize:10, color:'#3B6D11' }}>✓</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="f13" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</div>
                <div className="f11" style={{ color: isOverdue(a.date) ? '#E24B4A' : 'var(--text3)' }}>
                  {formatDate(a.date)}{a.companyId?.name ? ` · ${a.companyId.name}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}