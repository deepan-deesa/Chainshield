import React from 'react';
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

// View Imports
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CasesView from './components/CasesView';
import UploadView from './components/UploadView';
import VerifyView from './components/VerifyView';
import ExplorerView from './components/ExplorerView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import NotificationCenter from './components/NotificationCenter';
import LoginView from './components/LoginView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');

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

  // Derive block height on-the-fly
  const blockHeight = blocks.length > 0 ? Math.max(...blocks.map(b => b.blockNumber)) : 10425;

  // Signer / Ingestion callback
  const handleIngestEvidence = (newEvidence: EvidenceItem) => {
    // 1. Append the file signature to our secure local evidence state list
    setEvidence(prev => [newEvidence, ...prev]);

    // 2. Associate the file with the target case folder
    setCases(prev => prev.map(c => {
      if (c.id === newEvidence.caseId) {
        return {
          ...c,
          evidenceIds: [...c.evidenceIds, newEvidence.id]
        };
      }
      return c;
    }));

    // 3. Create a corresponding ledger block record representing decentralized consensus validation
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

    // 4. Record high-security chain-of-custody audit log
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

    // 5. Fire alert notification broadcast
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

  // Callback to create a new case folder docket
  const handleAddCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
    
    // Broadcast notification
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

  // Helper to simulate random consensus network mine triggers (makes the UI feel incredibly alive!)
  const handleMineSimulatedBlock = () => {
    if (evidence.length === 0) return;

    // Pick a random file to re-evaluate and simulate validation check
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

    // Create verification log
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

    // Add alert
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

  // Mark all alerts as read
  const setNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Render correct Tab view
  const renderTabView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            cases={cases}
            evidence={evidence}
            blocks={blocks}
            logs={logs}
            setActiveTab={setActiveTab}
            setSelectedCase={setSelectedCase}
            setSelectedEvidence={setSelectedEvidence}
          />
        );
      case 'cases':
        return (
          <CasesView 
            cases={cases}
            evidence={evidence}
            logs={logs}
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
            evidence={evidence}
          />
        );
      case 'explorer':
        return (
          <ExplorerView 
            blocks={blocks}
            onMineBlock={handleMineSimulatedBlock}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            cases={cases}
            evidence={evidence}
            logs={logs}
            blocks={blocks}
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
            cases={cases}
            evidence={evidence}
            blocks={blocks}
            logs={logs}
            setActiveTab={setActiveTab}
            setSelectedCase={setSelectedCase}
            setSelectedEvidence={setSelectedEvidence}
          />
        );
    }
  };

  // Handle server logout / disconnect
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col lg:flex-row font-sans overflow-hidden text-[#F0F6FC]">
      {/* Sidebar Navigation Panel */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto-reset target sub-selections when moving between primary panels
          if (tab !== 'cases') setSelectedCase(null);
          if (tab !== 'upload') setSelectedEvidence(null);
        }}
        user={user}
        notifications={notifications}
        setNotificationsRead={setNotificationsRead}
        onLogout={handleLogout}
        nodeCount={nodeCount}
        blockHeight={blockHeight}
      />

      {/* Main active workspace container */}
      <main className="flex-1 overflow-y-auto h-screen p-4 sm:p-6 md:p-8 space-y-6 relative max-w-7xl mx-auto w-full">
        {/* Transparent glass grid overlay for high-fidelity technical depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,246,252,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(240,246,252,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {renderTabView()}
      </main>
    </div>
  );
}
