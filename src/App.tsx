import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  initialCases, 
  initialEvidence, 
  initialBlocks, 
  initialAuditLogs, 
  initialNotifications 
} from './mockData';
import { Case, EvidenceItem, Block, AuditLog, SystemNotification, UserProfile } from './types';
import { generateTxHash } from './utils';

// View Imports - Lazy Loaded for optimal code splitting & quick page boot
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ProfileModal from './components/ProfileModal';

const DashboardView = lazy(() => import('./components/DashboardView'));
const CasesView = lazy(() => import('./components/CasesView'));
const UploadView = lazy(() => import('./components/UploadView'));
const VerifyView = lazy(() => import('./components/VerifyView'));
const ExplorerView = lazy(() => import('./components/ExplorerView'));
const ReportsView = lazy(() => import('./components/ReportsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

// Fallback spinner component during view loading
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-[#1F6FEB]/20 border-t-[#1F6FEB] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-[#1F6FEB] rounded-full animate-ping" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-sm text-white tracking-widest uppercase">Initializing Vault Enclave</h3>
        <p className="text-xs font-mono text-gray-400 tracking-wider">Establishing Supabase Session & Cryptographic Tokens...</p>
      </div>
    </div>
  );
}


function MainAppContent() {
  const { user: authUser, profile, loading, logout, updateProfileState } = useAuth();
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  const handleUpdateUser = (updatedUser: UserProfile) => {
    updateProfileState(updatedUser);
  };

  // Theme state: dark / light
  const [theme, setTheme] = React.useState<string>(() => {
    return localStorage.getItem('chainshield_theme') || 'dark';
  });

  // Global Real-time Search State
  const [searchQuery, setSearchQuery] = React.useState('');

  // State Engine
  const [cases, setCases] = React.useState<Case[]>(initialCases);
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>(initialEvidence);
  const [blocks, setBlocks] = React.useState<Block[]>(initialBlocks);
  const [logs, setLogs] = React.useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = React.useState<SystemNotification[]>(initialNotifications);
  
  // Custom interactive telemetry states
  const [nodeCount, setNodeCount] = React.useState(8);
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);
  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceItem | null>(null);

  // Safe default arrays to avoid undefined map errors
  const safeCases = cases || [];
  const safeEvidence = evidence || [];
  const safeBlocks = blocks || [];
  const safeLogs = logs || [];
  const safeNotifications = notifications || [];

  // Filter items in real-time based on global search query (Hooks defined BEFORE any early returns!)
  const q = searchQuery.toLowerCase().trim();
  const filteredCases = React.useMemo(() => {
    if (!q) return safeCases;
    return safeCases.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q)
    );
  }, [safeCases, q]);

  const filteredEvidence = React.useMemo(() => {
    if (!q) return safeEvidence;
    return safeEvidence.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.id.toLowerCase().includes(q) || 
      e.sha256.toLowerCase().includes(q) || 
      e.caseId.toLowerCase().includes(q)
    );
  }, [safeEvidence, q]);

  const filteredBlocks = React.useMemo(() => {
    if (!q) return safeBlocks;
    return safeBlocks.filter(b => 
      b.currentHash.toLowerCase().includes(q) || 
      b.evidenceName.toLowerCase().includes(q) || 
      b.blockNumber.toString().includes(q)
    );
  }, [safeBlocks, q]);

  const filteredLogs = React.useMemo(() => {
    if (!q) return safeLogs;
    return safeLogs.filter(l => 
      l.details.toLowerCase().includes(q) || 
      l.evidenceId.toLowerCase().includes(q) || 
      l.action.toLowerCase().includes(q)
    );
  }, [safeLogs, q]);

  // Update theme data attribute on html element
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chainshield_theme', theme);
  }, [theme]);

  // Set Page Title for SEO
  React.useEffect(() => {
    document.title = "ChainShield | Immutable Digital Evidence Vault";
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // CONDITIONAL RENDERING / EARLY RETURNS (Defined AFTER all React Hooks!)
  
  // 1. If loading session state from Supabase Auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-white font-mono">
        <LoadingFallback />
      </div>
    );
  }

  // 2. PROTECTED ROUTE ENFORCEMENT: If user is not authenticated, show Login/Signup View
  if (!authUser) {
    if (authMode === 'signup') {
      return <SignUpView onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginView onSwitchToSignUp={() => setAuthMode('signup')} />;
  }

  // Active user profile fallback guarantee
  const user = profile || {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Investigator',
    badgeNumber: authUser.user_metadata?.badge_number || `SH-${authUser.id.substring(0, 4).toUpperCase()}`,
    role: 'EVIDENCE_ADMIN',
    department: 'Federal Cyber Crime Division',
    securityClearance: 'Level 5 (State-Security)',
    publicKey: `0x${authUser.id.replace(/-/g, '').substring(0, 40)}`,
    hardwareKeyId: `YubiKey-FIDO2-${authUser.id.substring(0, 4)}`,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  };


  // Derive block height on-the-fly
  const blockHeight = safeBlocks.length > 0 ? Math.max(...safeBlocks.map(b => b.blockNumber)) : 10425;

  // Signer / Ingestion callback (automatically includes user.id)
  const handleIngestEvidence = (newEvidence: EvidenceItem) => {
    setEvidence(prev => [newEvidence, ...(prev || [])]);

    setCases(prev => (prev || []).map(c => {
      if (c.id === newEvidence.caseId) {
        return {
          ...c,
          evidenceIds: [...(c.evidenceIds || []), newEvidence.id]
        };
      }
      return c;
    }));

    const lastBlock = safeBlocks[safeBlocks.length - 1];
    const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 10426;
    const associatedCaseObj = safeCases.find(c => c.id === newEvidence.caseId);

    const newBlock: Block = {
      blockNumber: newBlockNumber,
      previousHash: lastBlock ? lastBlock.currentHash : generateTxHash(),
      currentHash: generateTxHash(),
      timestamp: new Date().toISOString(),
      caseId: newEvidence.caseId,
      caseTitle: associatedCaseObj ? associatedCaseObj.title : 'External Security Stream',
      evidenceId: newEvidence.id,
      evidenceName: newEvidence.name,
      officer: user.name,
      badgeNumber: user.badgeNumber,
      fileHash: newEvidence.sha256,
      status: 'STABLE',
      nonce: Math.floor(10000 + Math.random() * 90000)
    };

    setBlocks(prev => [...(prev || []), newBlock]);

    const newAuditLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      evidenceId: newEvidence.id,
      timestamp: new Date().toISOString(),
      officer: user.name,
      badgeNumber: user.badgeNumber,
      action: 'INGESTION',
      location: 'Federal Evidence Lab',
      status: 'VERIFIED',
      blockNumber: newBlockNumber,
      txHash: newBlock.currentHash,
      details: `Asset "${newEvidence.name}" ingested under Case ${newEvidence.caseId} by ${user.name} (${user.id}). Signature matched consensus.`
    };

    setLogs(prev => [newAuditLog, ...(prev || [])]);

    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'SUCCESS',
      title: 'Evidence Signature Anchored',
      message: `File "${newEvidence.name}" committed to immutable block #${newBlockNumber}. Owner ID: ${user.id}.`,
      timestamp: new Date().toISOString(),
      read: false,
      blockNumber: newBlockNumber
    };

    setNotifications(prev => [newNotification, ...(prev || [])]);
  };

  const handleAddCase = (newCase: Case) => {
    setCases(prev => [newCase, ...(prev || [])]);
    
    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'INFO',
      title: 'Investigation Docket Initialized',
      message: `New case locker ${newCase.id} successfully partitioned for ${user.name}.`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...(prev || [])]);
  };

  const setNotificationsRead = () => {
    setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans antialiased selection:bg-[#1F6FEB]/30 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        notifications={safeNotifications}
        setNotificationsRead={setNotificationsRead}
        onLogout={logout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        nodeCount={nodeCount}
        blockHeight={blockHeight}
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Profile Dossier Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={logout}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Workspace Body Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {activeTab === 'dashboard' && (
              <DashboardView
                cases={filteredCases}
                evidence={filteredEvidence}
                blocks={filteredBlocks}
                logs={filteredLogs}
                setActiveTab={setActiveTab}
                setSelectedCase={setSelectedCase}
                setSelectedEvidence={setSelectedEvidence}
              />
            )}

            {activeTab === 'cases' && (
              <CasesView
                cases={filteredCases}
                evidence={filteredEvidence}
                logs={filteredLogs}
                setSelectedEvidence={setSelectedEvidence}
                setActiveTab={setActiveTab}
                selectedCase={selectedCase}
                setSelectedCase={setSelectedCase}
                onAddCase={handleAddCase}
                currentUser={user.name}
                badgeNumber={user.badgeNumber}
              />
            )}

            {activeTab === 'upload' && (
              <UploadView
                cases={safeCases}
                activeCase={selectedCase}
                onIngestEvidence={handleIngestEvidence}
                selectedEvidence={selectedEvidence}
                setSelectedEvidence={setSelectedEvidence}
                currentUser={user.name}
                badgeNumber={user.badgeNumber}
              />
            )}

            {activeTab === 'verify' && (
              <VerifyView
                evidence={filteredEvidence}
                blocks={filteredBlocks}
                logs={filteredLogs}
                selectedEvidence={selectedEvidence}
                setSelectedEvidence={setSelectedEvidence}
                currentUser={user.name}
                badgeNumber={user.badgeNumber}
              />
            )}

            {activeTab === 'explorer' && (
              <ExplorerView
                blocks={filteredBlocks}
                evidence={filteredEvidence}
                cases={filteredCases}
                logs={filteredLogs}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                cases={filteredCases}
                evidence={filteredEvidence}
                logs={filteredLogs}
                blocks={filteredBlocks}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                onUpdateUser={handleUpdateUser}
                nodeCount={nodeCount}
                setNodeCount={setNodeCount}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={safeNotifications}
                onMarkRead={(id) => setNotifications(prev => (prev || []).map(n => n.id === id ? { ...n, read: true } : n))}
                onClearAll={() => setNotifications([])}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

