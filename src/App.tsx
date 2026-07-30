import React, { Suspense, lazy } from 'react';
import { 
  initialCases, 
  initialEvidence, 
  initialBlocks, 
  initialAuditLogs, 
  initialNotifications, 
  mockUserProfile 
} from './mockData';
import { Case, EvidenceItem, Block, AuditLog, SystemNotification, UserProfile } from './types';
import { generateTxHash } from './utils';

// View Imports - Lazy Loaded for optimal code splitting & quick page boot
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import LoginView from './components/LoginView';

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-4 border-[#1F6FEB]/30 border-t-[#1F6FEB] rounded-full animate-spin" />
      <p className="text-xs font-mono text-gray-400 tracking-wider uppercase">Loading Workspace Module...</p>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Theme state: dark / light
  const [theme, setTheme] = React.useState<string>(() => {
    return localStorage.getItem('chainshield_theme') || 'dark';
  });

  // Global Real-time Search State
  const [searchQuery, setSearchQuery] = React.useState('');

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

  // Unified State Engine
  const [user, setUser] = React.useState<UserProfile>(mockUserProfile);
  const [cases, setCases] = React.useState<Case[]>(initialCases);
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>(initialEvidence);
  const [blocks, setBlocks] = React.useState<Block[]>(initialBlocks);
  const [logs, setLogs] = React.useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = React.useState<SystemNotification[]>(initialNotifications);
  
  // Custom interactive telemetry states
  const [nodeCount, setNodeCount] = React.useState(8);
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);
  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceItem | null>(null);

  // Filter items in real-time based on global search query
  const q = searchQuery.toLowerCase().trim();
  const filteredCases = React.useMemo(() => {
    if (!q) return cases;
    return cases.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q)
    );
  }, [cases, q]);

  const filteredEvidence = React.useMemo(() => {
    if (!q) return evidence;
    return evidence.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.id.toLowerCase().includes(q) || 
      e.sha256.toLowerCase().includes(q) || 
      e.caseId.toLowerCase().includes(q)
    );
  }, [evidence, q]);

  const filteredBlocks = React.useMemo(() => {
    if (!q) return blocks;
    return blocks.filter(b => 
      b.currentHash.toLowerCase().includes(q) || 
      b.evidenceName.toLowerCase().includes(q) || 
      b.blockNumber.toString().includes(q)
    );
  }, [blocks, q]);

  const filteredLogs = React.useMemo(() => {
    if (!q) return logs;
    return logs.filter(l => 
      l.details.toLowerCase().includes(q) || 
      l.evidenceId.toLowerCase().includes(q) || 
      l.action.toLowerCase().includes(q)
    );
  }, [logs, q]);

  // Derive block height on-the-fly
  const blockHeight = blocks.length > 0 ? Math.max(...blocks.map(b => b.blockNumber)) : 10425;

  // Signer / Ingestion callback
  const handleIngestEvidence = (newEvidence: EvidenceItem) => {
    setEvidence(prev => [newEvidence, ...prev]);

    setCases(prev => prev.map(c => {
      if (c.id === newEvidence.caseId) {
        return {
          ...c,
          evidenceIds: [...c.evidenceIds, newEvidence.id]
        };
      }
      return c;
    }));

    const lastBlock = blocks[blocks.length - 1];
    const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 10426;
    const associatedCaseObj = cases.find(c => c.id === newEvidence.caseId);

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

    setBlocks(prev => [...prev, newBlock]);

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
      details: `Asset "${newEvidence.name}" ingested under Case ${newEvidence.caseId}. Signature matched blockchain consensus.`
    };

    setLogs(prev => [newAuditLog, ...prev]);

    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'SUCCESS',
      title: 'Evidence Signature Anchored',
      message: `File "${newEvidence.name}" committed locally to immutable block #${newBlockNumber}. Consensus node verified: 100%.`,
      timestamp: new Date().toISOString(),
      read: false,
      blockNumber: newBlockNumber
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleAddCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
    
    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'INFO',
      title: 'Investigation Docket Initialized',
      message: `New case locker ${newCase.id} successfully partitioned and encrypted. Ready for forensic ingestion.`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMineSimulatedBlock = () => {
    if (evidence.length === 0) return;

    const randomEvidence = evidence[Math.floor(Math.random() * evidence.length)];
    const associatedCase = cases.find(c => c.id === randomEvidence.caseId);

    const lastBlock = blocks[blocks.length - 1];
    const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 10426;

    const simulatedBlock: Block = {
      blockNumber: newBlockNumber,
      previousHash: lastBlock ? lastBlock.currentHash : generateTxHash(),
      currentHash: generateTxHash(),
      timestamp: new Date().toISOString(),
      caseId: randomEvidence.caseId,
      caseTitle: associatedCase ? associatedCase.title : 'State Wide Secure Network',
      evidenceId: randomEvidence.id,
      evidenceName: randomEvidence.name,
      officer: 'Consensus Node Auto-Validator',
      badgeNumber: 'VALIDATOR-NODE',
      fileHash: randomEvidence.sha256,
      status: 'STABLE',
      nonce: Math.floor(10000 + Math.random() * 90000)
    };

    setBlocks(prev => [...prev, simulatedBlock]);

    const checkLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      evidenceId: randomEvidence.id,
      timestamp: new Date().toISOString(),
      officer: 'Autopilot Consensus Daemon',
      badgeNumber: 'NODE-SHIELD',
      action: 'COURT_VERIFICATION',
      location: 'Consensus Network Validator',
      status: 'VERIFIED',
      blockNumber: newBlockNumber,
      txHash: simulatedBlock.currentHash,
      details: `Consensus synchronization tick. Re-evaluated "${randomEvidence.name}" original SHA-256 lock. Status matched perfectly.`
    };

    setLogs(prev => [checkLog, ...prev]);

    const newNotification: SystemNotification = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'SUCCESS',
      title: 'Integrity Scan Completed',
      message: `Automatic ledger block #${newBlockNumber} synchronized. Validated signature consistency for "${randomEvidence.name}".`,
      timestamp: new Date().toISOString(),
      read: false,
      blockNumber: newBlockNumber
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const setNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Render correct Tab view with Suspense wrapper
  const renderTabView = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return (
                <DashboardView 
                  cases={filteredCases}
                  evidence={filteredEvidence}
                  blocks={filteredBlocks}
                  logs={filteredLogs}
                  setActiveTab={setActiveTab}
                  setSelectedCase={setSelectedCase}
                  setSelectedEvidence={setSelectedEvidence}
                />
              );
            case 'cases':
              return (
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
              );
            case 'upload':
              return (
                <UploadView 
                  cases={cases}
                  activeCase={selectedCase}
                  onIngestEvidence={handleIngestEvidence}
                  selectedEvidence={selectedEvidence}
                  setSelectedEvidence={setSelectedEvidence}
                  currentUser={user.name}
                  badgeNumber={user.badgeNumber}
                />
              );
            case 'verify':
              return (
                <VerifyView 
                  evidence={filteredEvidence}
                />
              );
            case 'explorer':
              return (
                <ExplorerView 
                  blocks={filteredBlocks}
                  onMineBlock={handleMineSimulatedBlock}
                />
              );
            case 'reports':
              return (
                <ReportsView 
                  cases={filteredCases}
                  evidence={filteredEvidence}
                  logs={filteredLogs}
                  blocks={filteredBlocks}
                />
              );
            case 'settings':
              return (
                <SettingsView 
                  user={user}
                  onUpdateUser={setUser}
                  nodeCount={nodeCount}
                  setNodeCount={setNodeCount}
                />
              );
            case 'notifications':
              return (
                <NotificationCenter 
                  notifications={notifications}
                  onMarkRead={handleMarkNotificationRead}
                  onClearAll={handleClearNotifications}
                />
              );
            default:
              return (
                <DashboardView 
                  cases={filteredCases}
                  evidence={filteredEvidence}
                  blocks={filteredBlocks}
                  logs={filteredLogs}
                  setActiveTab={setActiveTab}
                  setSelectedCase={setSelectedCase}
                  setSelectedEvidence={setSelectedEvidence}
                />
              );
          }
        })()}
      </Suspense>
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row font-sans overflow-hidden text-[var(--text-primary)] transition-colors duration-300">
      {/* Sidebar Navigation Panel */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'cases') setSelectedCase(null);
          if (tab !== 'upload') setSelectedEvidence(null);
        }}
        user={user}
        notifications={notifications}
        setNotificationsRead={setNotificationsRead}
        onLogout={handleLogout}
        nodeCount={nodeCount}
        blockHeight={blockHeight}
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main active workspace container */}
      <main className="flex-1 overflow-y-auto h-screen p-4 sm:p-6 md:p-8 space-y-6 relative max-w-7xl mx-auto w-full animate-fade-in">
        {/* Transparent glass grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,246,252,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(240,246,252,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {renderTabView()}
      </main>
    </div>
  );
}
