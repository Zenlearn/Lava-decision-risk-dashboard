import React from 'react';
import { 
  LayoutDashboard, ShieldAlert, UploadCloud, ChevronRight, 
  MapPin, CheckCircle, AlertTriangle, RefreshCw, Send, LogOut, FileSpreadsheet,
  Settings, BookOpen, AlertCircle, TrendingUp, Info, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nominatedCount: number;
  handleSignOut: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, nominatedCount, handleSignOut }: SidebarProps) {
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

  return (
    <aside className="zen-sidebar" style={{
      width: '260px',
      background: '#0f172a',
      borderRight: '1px solid rgba(255,255,255,0.1)',
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
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo_144.png"
            alt="ZenLearn"
            style={{ height: '32px', width: 'auto', display: 'block', borderRadius: '4px' }}
          />
          <span style={{ fontSize: '11px', color: '#c5d1ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Decision Intel
          </span>
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
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#3b82f6' : '#64748b' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: 'var(--bad, #ef4444)',
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

      {/* Footer / Logout */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            textAlign: 'left',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
