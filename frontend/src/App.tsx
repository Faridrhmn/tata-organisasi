import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { VaultPage } from './pages/VaultPage';
import { PosterPage } from './pages/PosterPage';
import { PlannerPage } from './pages/PlannerPage';
import { AuditPage } from './pages/AuditPage';
import { AuthPage } from './pages/AuthPage';
import { MembersPage } from './pages/MembersPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [initialPlannerData, setInitialPlannerData] = useState<{
    title: string;
    caption: string;
    campaign: string;
  } | null>(null);

  const handleScheduleFromPoster = (data: {
    title: string;
    caption: string;
    campaign: string;
  }) => {
    setInitialPlannerData(data);
    setCurrentModule('planner');
  };

  useEffect(() => {
    // Cek apakah ada token yang tersimpan di browser
    const savedToken = localStorage.getItem('tari_token');
    if (savedToken) {
      // Mock / restore user session
      setCurrentUser({
        id: 'usr-cached',
        email: 'patrick@tari.org',
        full_name: 'Patrick Maulana',
        is_superadmin: true,
      });
    }
  }, []);

  const handleLoginSuccess = (user: any, _token: string) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('tari_token');
    setCurrentUser(null);
  };

  // Jika belum login, tampilkan halaman Login / Registrasi
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppLayout
      currentModule={currentModule}
      onSelectModule={setCurrentModule}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {currentModule === 'dashboard' && (
        <DashboardPage orgName="Masjid Al-Ikhlas" onSelectModule={setCurrentModule} />
      )}

      {currentModule === 'finance' && (
        <FinancePage />
      )}

      {currentModule === 'vault' && (
        <VaultPage />
      )}

      {currentModule === 'poster' && (
        <PosterPage onScheduleToPlanner={handleScheduleFromPoster} />
      )}

      {currentModule === 'planner' && (
        <PlannerPage
          initialData={initialPlannerData}
          onClearInitialData={() => setInitialPlannerData(null)}
        />
      )}

      {currentModule === 'audit' && (
        <AuditPage />
      )}

      {currentModule === 'members' && (
        <MembersPage />
      )}

      {currentModule === 'settings' && (
        <SettingsPage />
      )}

      {currentModule !== 'dashboard' && currentModule !== 'finance' && currentModule !== 'vault' && currentModule !== 'poster' && currentModule !== 'planner' && currentModule !== 'audit' && currentModule !== 'members' && currentModule !== 'settings' && (
        <div className="bg-white rounded-lg p-12 text-center border border-gitlab-panelBorder shadow-gitlab">
          <div className="text-3xl mb-3">🚧</div>
          <h2 className="text-lg font-bold text-slate-800 capitalize mb-1">
            Modul {currentModule}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Modul ini berada dalam antrean Kanban sprint berikutnya (Fase 1 / Fase 2).
            Silakan cek file <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-purple-700">KANBAN.md</code> untuk memantau status pengerjaan.
          </p>
        </div>
      )}
    </AppLayout>
  );
}

export default App;
