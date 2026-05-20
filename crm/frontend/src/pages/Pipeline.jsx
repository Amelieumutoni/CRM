import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDeals, updateDeal } from '../api';
import Badge from '../components/Badge';
import { formatCurrency, STAGES, STAGE_COLORS, id } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function Pipeline() {
  const { data: deals, loading, refetch } = useApi(getDeals);
  const nav = useNavigate();
  const { showToast } = useApp();

  async function move(deal, stage) {
    try { await updateDeal(id(deal), { ...deal, stage, companyId: id(deal.companyId), contactId: id(deal.contactId) }); refetch(); showToast(`Moved to ${stage}`); }
    catch { showToast('Failed'); }
  }

  if (loading) return <div className="muted f13">Loading…</div>;

  return (
    <div>
      <div className="page-hdr">
        <h1>Pipeline</h1>
        <button className="btn btn-primary btn-sm" onClick={() => nav('/deals')}>+ New deal</button>
      </div>
      <div className="pipeline-board">
        {STAGES.slice(0, 6).map(stage => {
          const cols  = (deals || []).filter(d => d.stage === stage);
          const total = cols.reduce((s, d) => s + d.value, 0);
          const sc    = STAGE_COLORS[stage] || {};
          return (
            <div key={stage} className="p-col">
              <div className="p-col-hdr" style={{ background: sc.bg }}>
                <span className="f12 fw5" style={{ color: sc.text }}>{stage}</span>
                <span className="f11" style={{ color: sc.text, opacity: .7 }}>{cols.length}</span>
              </div>
              <div className="p-col-val">{formatCurrency(total)}</div>
              {cols.map(d => (
                <div key={id(d)} className="deal-card" onClick={() => nav(`/deals/${id(d)}`)}>
                  <div className="fw5 f13 mb4" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</div>
                  <div className="f11 muted mb8">{d.companyId?.name}</div>
                  <div className="row-between">
                    <span className="fw5 f13">{formatCurrency(d.value)}</span>
                    <span className="f11 dim">{d.probability}%</span>
                  </div>
                  <div className="prog-wrap mt8">
                    <div className="prog-bar" style={{ width:`${d.probability}%`, background: sc.border }} />
                  </div>
                </div>
              ))}
              {cols.length === 0 && <div className="k-empty">No deals</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}