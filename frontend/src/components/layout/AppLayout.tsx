import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onSelectModule: (module: string) => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentModule,
  onSelectModule,
  currentUser,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Organizations
  const [organizations] = useState<Organization[]>([
    { id: 'org-1', name: 'Masjid Al-Ikhlas', role: 'owner' },
    { id: 'org-2', name: 'Yayasan Peduli Umat', role: 'admin_media' },
    { id: 'org-3', name: 'Komunitas Pemuda Hijrah', role: 'bendahara' },
  ]);

  const [currentOrg, setCurrentOrg] = useState<Organization>(organizations[0]);

  return (
    <div className="flex h-screen bg-gitlab-bg overflow-hidden font-sans text-gitlab-text">
      {/* GitLab Light Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={onSelectModule}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gitlab-bg">
        {/* Topbar with breadcrumb & global controls */}
        <Topbar
          currentModule={currentModule}
          currentOrg={currentOrg}
          organizations={organizations}
          onSelectOrg={setCurrentOrg}
          currentUser={currentUser}
          onLogout={onLogout}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onSelectModule={onSelectModule}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
