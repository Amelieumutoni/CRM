import { NavLink } from 'react-router-dom';
const NAV = [
  { to: '/',           icon: '⊞', label: 'Dashboard'  },
  { to: '/pipeline',   icon: '◈', label: 'Pipeline'   },
  { to: '/deals',      icon: '◆', label: 'Deals'      },
  { to: '/companies',  icon: '⬡', label: 'Companies'  },
  { to: '/contacts',   icon: '◉', label: 'Contacts'   },
  { to: '/activities', icon: '◷', label: 'Activities' },
  { to: '/grants',     icon: '◎', label: 'Grants'     },
];
export default function Sidebar({ openDeals = 0, overdueCount = 0 }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="name">SalesCRM</div>
        <div className="sub">B2B Sales Workspace</div>
      </div>
      <nav className="sb-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span style={{ fontSize: 15 }}>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="sb-stat"><div className="num">{openDeals}</div><div className="lbl">open deals</div></div>
        <div className="sb-stat">
          <div className="num" style={overdueCount > 0 ? { color: '#A32D2D' } : {}}>{overdueCount}</div>
          <div className="lbl">overdue</div>
        </div>
      </div>
    </aside>
  );
}