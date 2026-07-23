import React from 'react';
import { 
  LayoutDashboard, ShieldAlert, UploadCloud, ChevronRight, 
  MapPin, CheckCircle, AlertTriangle, RefreshCw, Send, LogOut, FileSpreadsheet,
  Settings, BookOpen, AlertCircle, TrendingUp, Info, HelpCircle, User, Activity, Clock
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
    { id: 'exec', label: 'Executive One-Pager', icon: LayoutDashboard },
    { id: 'deep', label: 'Score Card', icon: CheckCircle },
    { 
      id: 'coach', 
      label: 'Coaching Card', 
      icon: BookOpen,
      badge: nominatedCount > 0 ? nominatedCount : undefined 
    },
    { id: 'ins', label: 'Insights', icon: TrendingUp },
    { id: 'eved', label: 'Evidence & Hit-List', icon: ShieldAlert },
    { id: 'cost', label: 'Part-Cost Assumptions', icon: Settings },
    { id: 'upload', label: 'Ingest Data', icon: UploadCloud },
  ];

  // Default fallback user details — empty string so sidebar shows nothing if user not yet loaded
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const handleActivitiesClick = () => {
    setActiveTab('activities');
  };

  return (
    <aside className="zen-sidebar" style={{
      width: '260px',
      background: '#111827', // Sleek Obsidian Charcoal
      borderRight: '1px solid rgba(255,255,255,0.06)',
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
      <div className="brand-header" style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo_144.png"
            alt="ZenLearn"
            style={{ height: '36px', width: 'auto', display: 'block', borderRadius: '4px', flexShrink: 0 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              ZenLearn
            </span>
            <span style={{ fontSize: '10px', color: '#E50046', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Decision Intel
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
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
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(229, 0, 70, 0.12)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                borderLeft: isActive ? '3px solid #E50046' : '3px solid transparent',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#E50046' : '#64748b' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: '#E50046',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Context bottom section replicating the ZenLearn application layout */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Profile Header */}
        <div 
          onClick={handleProfileClick}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#E50046',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            {userInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
            <span style={{ fontSize: '11px', color: '#8094ae', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail}
            </span>
          </div>
        </div>

        {/* Profile Action Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={handleProfileClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              border: 'none',
              background: 'transparent',
              color: '#8094ae',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8094ae')}
          >
            <User size={15} />
            <span>Profile</span>
          </button>
          <button 
            onClick={handleActivitiesClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              border: 'none',
              background: 'transparent',
              color: '#8094ae',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8094ae')}
          >
            <Clock size={15} />
            <span>Your Activities</span>
          </button>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 8px',
              border: 'none',
              background: 'transparent',
              color: '#8094ae',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8094ae')}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
