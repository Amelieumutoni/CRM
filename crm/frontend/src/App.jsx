import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import { getDashStats } from './api';
import Login from './pages/Login';

import Dashboard     from './pages/Dashboard';
import Pipeline      from './pages/Pipeline';
import Deals         from './pages/Deals';
import DealDetail    from './pages/DealDetail';
import Companies     from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Contacts      from './pages/Contacts';
import Activities    from './pages/Activities';
import Grants        from './pages/Grants';

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('crm_user')); }
  catch { return null; }
}

export default function App() {
  const [stats,       setStats]       = useState({ openDeals: 0, overdueCount: 0 });
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    if (!currentUser) return;
    getDashStats().then(r => setStats(r.data)).catch(() => {});
  }, [currentUser]);

  function handleLogin(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setCurrentUser(null);
  }

  // Not logged in — show login page
  if (!currentUser) {
    return (
      <AppProvider>
        <Login onLogin={handleLogin} />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <Sidebar
            openDeals={stats.openDeals}
            overdueCount={stats.overdueCount}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <main className="main">
            <Routes>
              <Route path="/"              element={<Dashboard onStats={setStats} />} />
              <Route path="/pipeline"      element={<Pipeline />} />
              <Route path="/deals"         element={<Deals />} />
              <Route path="/deals/:id"     element={<DealDetail />} />
              <Route path="/companies"     element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/contacts"      element={<Contacts />} />
              <Route path="/activities"    element={<Activities />} />
              <Route path="/grants"        element={<Grants />} />
              <Route path="*"             element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}