import React from 'react';
import { 
  LayoutDashboard, ShieldAlert, UploadCloud,
  CheckCircle, LogOut, FileSpreadsheet,
  Settings, BookOpen, AlertCircle, TrendingUp, User, Activity, Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nominatedCount: number;
  handleSignOut: () => void;
  user?: {
    name: string;
    email: string;
  };
}

export default function Sidebar({ activeTab, setActiveTab, nominatedCount, handleSignOut, user }: SidebarProps) {
  const menuItems = [
    { id: 'exec', label: 'Executive KPIs', icon: LayoutDashboard },
    { id: 'org_kpi', label: 'Org KPIs', icon: Activity },
    { id: 'deep', label: 'Score Card', icon: CheckCircle },
    { 
      id: 'coach', 
      label: 'Coaching Card', 
      icon: BookOpen,
      badge: nominatedCount > 0 ? nominatedCount : undefined 
    },
    { id: 'ins', label: 'Insights', icon: TrendingUp },
    { id: 'eved', label: 'Evidence & Hit-List', icon: ShieldAlert },
    { id: 'cost', label: 'Part Exposure', icon: Settings },
    { id: 'upload', label: 'Ingest Data', icon: UploadCloud },
  ];

  // Default fallback user details — empty string so sidebar shows nothing if user not yet loaded
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleProfileClick = () => setActiveTab('profile');
  const handleActivitiesClick = () => setActiveTab('activities');

  return (
    <aside className="zen-sidebar" style={{
      width: '260px',
      // Premium Light Theme
      background: 'linear-gradient(180deg, #ffffff 0%, #f4f7fa 100%)',
      borderRight: '1px solid #e2e8f0',
      boxShadow: '1px 0 16px rgba(15, 23, 42, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      color: '#0f172a'
    }}>

      {/* Brand Header */}
      <div style={{
        padding: '24px 20px 20px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        background: 'linear-gradient(180deg, #1B264F 0%, #151e3f 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(27, 38, 79, 0.15)'
      }}>
        {/* ZenLearn Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: '#ffffff',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>
          <img
            src="/logo_compressed.jpeg"
            alt="ZenLearn Logo"
            style={{
              height: '28px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>
              ZenLearn
            </span>
            <span style={{ background: 'rgba(229, 0, 70, 0.3)', color: '#ff6b8b', fontSize: '9.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PRO
            </span>
          </div>
          <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Decision Intelligence
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, #eff6ff 0%, transparent 100%)' : 'transparent',
                color: isActive ? '#0b1120' : '#475569',
                borderLeft: isActive ? '3px solid #E50046' : '3px solid transparent',
                textAlign: 'left',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f4f7fa';
                  e.currentTarget.style.color = '#0b1120';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <Icon 
                size={17} 
                style={{ 
                  color: isActive ? '#E50046' : '#64748b',
                  flexShrink: 0
                }} 
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: '#E50046',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '2px 7px',
                  fontSize: '10.5px',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Context — bottom section */}
      <div style={{
        borderTop: '1px solid #f1f5f9',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
      }}>
        {/* Profile Avatar + Name */}
        <div 
          onClick={handleProfileClick}
          style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E50046 0%, #b8003a 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(229,0,70,0.35)',
          }}>
            {userInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
            <span style={{ fontSize: '10.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail}
            </span>
          </div>
        </div>

        {/* Profile Action Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {([
            { label: 'Profile', icon: User, onClick: handleProfileClick },
            { label: 'Your Activities', icon: Clock, onClick: handleActivitiesClick },
            { label: 'Sign out', icon: LogOut, onClick: handleSignOut },
          ] as { label: string; icon: React.ElementType; onClick: () => void }[]).map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '5px 6px',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
