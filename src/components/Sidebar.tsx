import React from 'react';
import { 
  LayoutDashboard, 
  FolderClosed, 
  UploadCloud, 
  ShieldCheck, 
  Database, 
  FileSpreadsheet, 
  Settings, 
  User, 
  Activity, 
  ShieldAlert,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { UserProfile, SystemNotification } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  notifications: SystemNotification[];
  setNotificationsRead: () => void;
  onLogout: () => void;
  nodeCount: number;
  blockHeight: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  notifications,
  setNotificationsRead,
  onLogout,
  nodeCount,
  blockHeight
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Tactical Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Case Directory', icon: FolderClosed },
    { id: 'upload', label: 'Evidence Ingestion', icon: UploadCloud },
    { id: 'verify', label: 'Integrity Verifier', icon: ShieldCheck },
    { id: 'explorer', label: 'Ledger Explorer', icon: Database },
    { id: 'reports', label: 'Court Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Security & Node', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Nav Bar Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800 text-white z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#1F6FEB] animate-pulse" />
          <span className="font-display font-bold tracking-wider text-sm">CHAINSHIELD</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setActiveTab('notifications');
              setNotificationsRead();
            }} 
            className="relative p-2 text-gray-400 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#D29922] rounded-full animate-ping" />
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-400 hover:text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0D1117] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Logo and Branding */}
        <div>
          <div className="p-6 border-b border-gray-800/80 flex items-center gap-3">
            <div className="p-2 bg-[#1F6FEB]/10 rounded-lg border border-[#1F6FEB]/20 glowing-blue">
              <ShieldAlert className="w-6 h-6 text-[#1F6FEB]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-wider text-[#F0F6FC]">CHAINSHIELD</h1>
              <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">FEDERAL EVIDENCE LOCK</p>
            </div>
          </div>

          {/* Connected User Badge */}
          <div className="p-4 mx-4 my-4 bg-[#161B22]/50 border border-gray-800 rounded-lg flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-[#1F6FEB]/30"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <h3 className="text-xs font-semibold text-[#F0F6FC] truncate">{user.name}</h3>
              <p className="text-[10px] font-mono text-gray-400">{user.badgeNumber}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-[#2EA043] rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-[#2EA043] tracking-wider uppercase font-semibold">Authorized</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[#1F6FEB]/10 border border-[#1F6FEB]/30 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#1F6FEB]' : 'text-gray-400 group-hover:text-white'}`} />
                    <span className="font-sans">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-[#1F6FEB] rounded-full glowing-blue" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Node Telemetry & Logged States */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="bg-[#161B22]/80 p-3 rounded-lg border border-gray-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8B949E] uppercase">Validation Peers</span>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#2EA043] animate-pulse" />
                <span className="text-[10px] font-mono text-[#2EA043] font-semibold">{nodeCount} Peers</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8B949E] uppercase">Block Height</span>
              <span className="text-[10px] font-mono text-[#F0F6FC] font-semibold">#{blockHeight}</span>
            </div>

            <div className="pt-1.5 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>Node Network</span>
              <span className="text-[#2EA043] font-medium uppercase text-[9px] px-1.5 py-0.5 bg-[#2EA043]/10 border border-[#2EA043]/20 rounded">Synchronized</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-transparent hover:bg-red-950/10 border border-gray-800 hover:border-red-900/30 text-gray-400 hover:text-red-400 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all duration-200"
          >
            Sever Connection
          </button>
        </div>
      </aside>
    </>
  );
}
