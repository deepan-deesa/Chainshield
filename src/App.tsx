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
import { 
  loadUserDataFromDB, 
  saveCaseToDB, 
  saveEvidenceToDB, 
  saveBlockToDB, 
  saveAuditLogToDB, 
  saveNotificationToDB, 
  clearAllDBData 
} from './lib/dbService';

// View Imports - Lazy Loaded for optimal code splitting & quick page boot
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ProfileModal from './components/ProfileModal';
import PixelBlast from './components/PixelBlast';

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

  // State Engine (Checks if demo data was cleared by user)
  const isDemoCleared = React.useMemo(() => localStorage.getItem('chainshield_cleared_demo') === 'true', []);

  const [cases, setCases] = React.useState<Case[]>(() => isDemoCleared ? [] : initialCases);
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>(() => isDemoCleared ? [] : initialEvidence);
  const [blocks, setBlocks] = React.useState<Block[]>(() => isDemoCleared ? [] : initialBlocks);
  const [logs, setLogs] = React.useState<AuditLog[]>(() => isDemoCleared ? [] : initialAuditLogs);
  const [notifications, setNotifications] = React.useState<SystemNotification[]>(() => isDemoCleared ? [] : initialNotifications);
  
  // Custom interactive telemetry states
  const [nodeCount, setNodeCount] = React.useState(8);
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);
  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceItem | null>(null);

  // Load database records on startup when user is authenticated
  React.useEffect(() => {
    if (authUser?.id) {
      loadUserDataFromDB(authUser.id).then((dbData) => {
        if (dbData.cases && dbData.cases.length > 0) setCases(dbData.cases);
        if (dbData.evidence && dbData.evidence.length > 0) setEvidence(dbData.evidence);
        if (dbData.blocks && dbData.blocks.length > 0) setBlocks(dbData.blocks);
        if (dbData.logs && dbData.logs.length > 0) setLogs(dbData.logs);
        if (dbData.notifications && dbData.notifications.length > 0) setNotifications(dbData.notifications);
      });
    }
  }, [authUser?.id]);

  // Clear demo data handler
  const handleClearDemoData = () => {
    setCases([]);
    setEvidence([]);
    setBlocks([]);
    setLogs([]);
    setNotifications([]);
    localStorage.setItem('chainshield_cleared_demo', 'true');
    if (authUser?.id) {
      clearAllDBData(authUser.id);
    }
  };

  // Scroll Navigation Configuration
  const TAB_ORDER = React.useMemo(() => ['dashboard', 'cases', 'upload', 'verify', 'explorer', 'reports', 'settings'], []);
  const TAB_LABELS: Record<string, string> = {
    dashboard: 'Tactical Dashboard',
    cases: 'Case Directory',
    upload: 'Evidence Ingestion',
    verify: 'Integrity Verifier',
    explorer: 'Ledger Explorer',
    reports: 'Court Reports',
    settings: 'Security & Node'
  };

  const goToNextTab = React.useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    setActiveTab(TAB_ORDER[nextIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, TAB_ORDER]);

  const goToPrevTab = React.useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    setActiveTab(TAB_ORDER[prevIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, TAB_ORDER]);

  // Keyboard arrow and scroll shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextTab();
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextTab, goToPrevTab]);

  // Reset demo data handler
  const handleResetDemoData = () => {
    setCases(initialCases);
    setEvidence(initialEvidence);
    setBlocks(initialBlocks);
    setLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    localStorage.removeItem('chainshield_cleared_demo');
  };

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

  // Signer / Ingestion callback (automatically includes user.id and persists to DB)
  const handleIngestEvidence = (newEvidence: EvidenceItem) => {
    setEvidence(prev => [newEvidence, ...(prev || [])]);
    saveEvidenceToDB(newEvidence, authUser.id);

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
    saveBlockToDB(newBlock, authUser.id);

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
    saveAuditLogToDB(newAuditLog, authUser.id);

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
    saveNotificationToDB(newNotification, authUser.id);
  };

  const handleAddCase = (newCase: Case) => {
    setCases(prev => [newCase, ...(prev || [])]);
    saveCaseToDB(newCase, authUser.id);
    
    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'INFO',
      title: 'Investigation Docket Initialized',
      message: `New case locker ${newCase.id} successfully partitioned for ${user.name}.`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...(prev || [])]);
    saveNotificationToDB(newNotification, authUser.id);
  };

  const setNotificationsRead = () => {
    setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans antialiased selection:bg-[#1F6FEB]/30 selection:text-white relative overflow-hidden">
      {/* Interactive PixelBlast Background Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#1F6FEB"
          patternScale={2.5}
          patternDensity={1.2}
          pixelSizeJitter={0.4}
          enableRipples={true}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={true}
          liquidStrength={0.08}
          liquidRadius={1.2}
          liquidWobbleSpeed={4}
          speed={0.4}
          edgeFade={0.35}
          transparent={true}
        />
      </div>

      {/* Navigation Sidebar */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
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
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
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
                onAddCase={handleAddCase}
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
                onClearDemoData={handleClearDemoData}
                onResetDemoData={handleResetDemoData}
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

      {/* Floating Interactive Scroll & Page Navigation Bar */}
      <div className="fixed bottom-5 right-5 lg:right-8 z-50 flex items-center gap-2 p-2 bg-[#161B22]/90 backdrop-blur-md border border-[#1F6FEB]/40 rounded-full shadow-2xl glowing-blue animate-fade-in">
        <button
          onClick={goToPrevTab}
          className="p-2 bg-[#0D1117] hover:bg-gray-800 text-gray-300 hover:text-white rounded-full transition-colors font-mono text-xs flex items-center gap-1 px-3"
          title="Move to previous section (Alt + Up)"
        >
          &larr; Prev
        </button>

        <div className="px-3 py-1 bg-[#0D1117]/80 rounded-full border border-gray-800 flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#1F6FEB] animate-ping" />
          <span className="text-[#1F6FEB] font-bold">
            {TAB_ORDER.indexOf(activeTab) + 1}/{TAB_ORDER.length}
          </span>
          <span className="text-gray-300 font-semibold hidden sm:inline">
            {TAB_LABELS[activeTab] || 'Section'}
          </span>
        </div>

        <button
          onClick={goToNextTab}
          className="p-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 text-white rounded-full transition-all shadow-md font-mono text-xs flex items-center gap-1 px-3 font-bold"
          title="Scroll to next section (Alt + Down)"
        >
          Next Section &rarr;
        </button>
      </div>

      </div>
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

