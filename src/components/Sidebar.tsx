import React from 'react';
import { 
  LayoutDashboard, 
  FolderClosed, 
  UploadCloud, 
  ShieldCheck, 
  Database, 
  FileSpreadsheet, 
  Settings, 
  Activity, 
  ShieldAlert,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  User,
  ChevronRight
} from 'lucide-react';
import { UserProfile, SystemNotification } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  notifications: SystemNotification[];
  setNotificationsRead: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  nodeCount: number;
  blockHeight: number;
  theme?: string;
  toggleTheme?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  notifications,
  setNotificationsRead,
  onLogout,
  onOpenProfile,
  nodeCount,
  blockHeight,
  theme = 'dark',
  toggleTheme,
  searchQuery = '',
  setSearchQuery
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
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenProfile} 
            className="flex items-center gap-1.5 p-1 px-2 border border-gray-800 hover:border-[#1F6FEB]/50 rounded-full bg-[#161B22] hover:bg-gray-800 transition-all"
            title="Open User Profile"
          >
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
              alt={user?.name || 'User'} 
              className="w-6 h-6 rounded-full border border-[#1F6FEB]/50 object-cover"
            />
            <span className="text-[10px] font-mono text-gray-300 max-w-[70px] truncate">{user?.name?.split(' ')[0] || 'Profile'}</span>
          </button>
          {toggleTheme && (
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>
          )}
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
          <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1F6FEB]/10 rounded-lg border border-[#1F6FEB]/20 glowing-blue">
                <ShieldAlert className="w-6 h-6 text-[#1F6FEB]" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-wider text-[#F0F6FC]">CHAINSHIELD</h1>
                <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">EVIDENCE VAULT</p>
              </div>
            </div>
            
            {toggleTheme && (
              <button 
                onClick={toggleTheme} 
                className="hidden lg:flex p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
              </button>
            )}
          </div>

          {/* Connected User Badge */}
          <button 
            onClick={() => {
              onOpenProfile();
              setMobileOpen(false);
            }}
            className="w-[calc(100%-2rem)] mx-4 my-3 p-3 bg-[#161B22]/70 hover:bg-[#1F6FEB]/10 border border-gray-800 hover:border-[#1F6FEB]/40 rounded-xl flex items-center justify-between transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
            title="Click to view & edit Profile"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <img 
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                  alt={user?.name || 'Investigator'} 
                  className="w-9 h-9 rounded-full border border-[#1F6FEB]/40 object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2EA043] rounded-full border border-[#0D1117] animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-semibold text-[#F0F6FC] group-hover:text-[#1F6FEB] truncate transition-colors">
                  {user?.name || 'Investigator'}
                </h3>
                <p className="text-[10px] font-mono text-gray-400 truncate">{user?.badgeNumber || 'SH-0000'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <User className="w-2.5 h-2.5 text-[#1F6FEB]" />
                  <span className="text-[9px] font-mono text-gray-400 group-hover:text-gray-300 transition-colors uppercase font-medium">View Profile</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#1F6FEB] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>


          {/* Real-time Global Search Input */}
          {setSearchQuery && (
            <div className="px-4 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter cases, files, hashes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161B22] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder-gray-500 focus:outline-none focus:border-[#1F6FEB]/60 focus:ring-1 focus:ring-[#1F6FEB]/60 font-sans transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-[10px] font-mono text-gray-500 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

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
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group btn-interactive
                    ${isActive 
                      ? 'bg-[#1F6FEB]/15 border border-[#1F6FEB]/40 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
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
            className="w-full py-2 bg-transparent hover:bg-red-950/20 border border-gray-800 hover:border-red-900/40 text-gray-400 hover:text-red-400 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all duration-200 btn-interactive"
          >
            Sever Connection
          </button>
        </div>
      </aside>
    </>
  );
}
