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

export default function Sidebar({ openDeals = 0, overdueCount = 0, currentUser, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="name">eFiche CRM</div>
        <div className="sub">B2B Sales Workspace</div>
      </div>

      <nav className="sb-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span style={{ fontSize:15 }}>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-stat">
          <div className="num">{openDeals}</div>
          <div className="lbl">open deals</div>
        </div>
        <div className="sb-stat">
          <div className="num" style={overdueCount > 0 ? { color:'#A32D2D' } : {}}>{overdueCount}</div>
          <div className="lbl">overdue</div>
        </div>

        {currentUser && (
          <div style={{
            gridColumn:'1/-1', borderTop:'0.5px solid var(--border)',
            paddingTop:10, marginTop:4,
          }}>
            <div className="f12 fw5">{currentUser.name}</div>
            <div className="dim f11" style={{ marginBottom:6 }}>{currentUser.email}</div>
            <button
              className="btn btn-sm btn-ghost"
              style={{ fontSize:11, width:'100%', justifyContent:'center' }}
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}