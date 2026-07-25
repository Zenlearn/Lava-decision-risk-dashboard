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
      // Rich Zenlearn Deep Space Navy — on-brand, easy on the eyes, premium depth
      // Replaces the harsh #111827 charcoal-black that was hurting readability
      background: 'linear-gradient(180deg, #1B264F 0%, #152045 45%, #0D1829 100%)',
      borderRight: '1px solid rgba(78, 103, 235, 0.14)',
      boxShadow: '4px 0 28px rgba(0, 0, 0, 0.30), inset -1px 0 0 rgba(78, 103, 235, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      color: '#f8fafc'
    }}>

      {/* Brand Header */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        {/* ZenLearn Logo on a fitted white pill */}
        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '4px 8px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          marginBottom: '6px'
        }}>
          <img
            src="/logo_compressed.jpeg"
            alt="ZenLearn Logo"
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            ZenLearn
          </span>
          <span style={{ fontSize: '10px', color: '#E50046', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Decision Intel
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
                background: isActive ? 'rgba(78, 103, 235, 0.20)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.58)',
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
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.88)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.58)';
                }
              }}
            >
              <Icon 
                size={17} 
                style={{ 
                  color: isActive ? '#E50046' : 'rgba(255,255,255,0.40)',
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
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'rgba(0,0,0,0.18)',
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
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
            <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                color: 'rgba(255,255,255,0.40)',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
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
