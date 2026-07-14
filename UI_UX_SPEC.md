# ChainShield: Comprehensive UI/UX Architecture Specification
## Complete Interface Design & Frontend System Blueprint for State-Grade Cyber Forensics

---

### 1. Complete Information Architecture
ChainShield's architectural taxonomy is mapped out hierarchically to support deep system-level auditing, multi-role views, and forensic data streams. The layout uses a **Structural Tactical Console (Glassmorphism)** with a sticky vertical navigation dock, status header, and modular main workspace canvas.

```
Application Root (/)
│
├── [Public Route] Authentication Portal (/auth/login)
│
└── [Protected Routes] State-Shield Console Layout (/console/*)
    │
    ├── Dashboard (/console/dashboard)
    │   ├── Global Metrics Desk
    │   ├── Activity & Verification Rates (Line/Bar Charts)
    │   ├── Live Ledger Feed (Stream Module)
    │   └── Security Alert Banner (Emergency Notification Container)
    │
    ├── Case Management (/console/cases)
    │   ├── Case Directory Grid/List (Multi-State Filter)
    │   ├── Create Case Modal (/console/cases/new)
    │   └── Case Detail View (/console/cases/:caseId)
    │       ├── Timeline of Custody
    │       ├── Evidence Locker Folder System
    │       └── Investigator Panel
    │
    ├── Evidence Management (/console/evidence)
    │   ├── Ingestion Center (/console/evidence/upload)
    │   │   ├── Drag-and-Drop Dropzone
    │   │   └── Native SHA-256 Client-Side Chunker
    │   └── Evidence File Details (/console/evidence/:evidenceId)
    │       ├── Forensic File Metadata Inspector
    │       ├── Playback/Preview Sandbox
    │       └── Ledger Verification Node Status
    │
    ├── Interactive Verification Deck (/console/verify)
    │   ├── Forensic Re-Hashing Playground
    │   └── Real-Time Ledger Comparison Ring
    │
    ├── Ledger/Blockchain Explorer (/console/explorer)
    │   ├── Global Ledger Stats Desk
    │   ├── Search Ledger Bar (Hash, Block, CaseID, Signer)
    │   ├── Scrolling Block Timeline Node Map
    │   └── Block Details Modal Panel
    │
    ├── Report Generator Suite (/console/reports)
    │   ├── Courtroom Evidence Package Builder
    │   ├── Certification PDF Generator Panel
    │   └── Audit Trail Export Desk
    │
    └── System Settings & Profile (/console/settings)
        ├── User Security Credentials (2FA/Hardware Key Signer)
        ├── Node Configuration Interface (Consensus, Sync Status)
        └── Theme & Accessibility Customization Panel
```

---

### 2. Complete User Navigation Flow
This state diagram represents the critical path a cybercrime investigator (Investigating Officer, Evidence Administrator, or Court Official) navigates to capture, log, track, and verify digital evidence.

```
       [ Start: Login Portal ]
                  │ (FIDO2 Keys / Multi-Factor Authenticated)
                  ▼
       [ Master Console Dashboard ] ───────┐
                  │                        │
        ┌─────────┴─────────┐              ├────────────────────────┐
        ▼                   ▼              ▼                        ▼
 [ Cases Directory ]  [ Ingestion Desk ] [ Verification Deck ] [ Ledger Explorer ]
        │                   │              │                        │
        │ (Select Case)     │ (Ingest File)│ (Drop check-file)      │ (Select Block)
        ▼                   ▼              ▼                        ▼
 [ Case Workspace ] ─> [ Hash Compute ] ─> [ Re-calculate Hash ]  [ Block Inspector ]
        │                   │              │                        │
        │ (Locker Item)     ▼ (Commit Block)│                      │
        └───────────────> [ Secure Upload ]┼────────────────────────┘
                            │              │ (Verify Hash Match)
                            ▼              ▼
                    [ Metadata Lock ] ──> [ Courtroom Report ]
```

---

### 3. Complete Folder Structure
Designed for enterprise React 19 scalability, using strict module boundaries, TypeScript type safety, and path-aliased structures.

```
src/
├── assets/                  # Public assets, static branding vector files, security watermarks
├── components/              # Shared pure UI elements (styled with Tailwind & Motion)
│   ├── ui/                  # Atomic components (Borders, Glass-cards, Inputs, Alerts)
│   ├── data-visualization/  # Recharts/D3 canvas controllers (Ledger curves, sync bars)
│   └── feedback/            # Verification rings, loaders, file chunking progress monitors
├── pages/                   # Complete screens matching navigation routes
│   ├── auth/                # Login, MFA challenge panels
│   ├── dashboard/           # Metrics desk, live ledger feed stream
│   ├── cases/               # Case directory, creation panel, individual case workspaces
│   ├── evidence/            # Ingestion deck, media preview sandbox, metadata inspectors
│   ├── verify/              # Dynamic drag-and-drop comparison suite
│   ├── explorer/            # Ledger block lists, block info inspectors
│   ├── reports/             # Government document design suite and export panel
│   └── settings/            # Node configurations, user profile, hardware keys management
├── hooks/                   # Custom reusable state mechanics
│   ├── useFileHasher.ts     # Client-side streaming SHA-256 chunking logic
│   ├── useLedgerSync.ts     # Blockchain node status checking and polling
│   └── useMediaPreview.ts   # Sanitized secure browser file sandboxing
├── layouts/                 # Page structures
│   ├── ConsoleLayout.tsx    # Left-dock vertical nav, dynamic top stats bar, main workspace
│   └── AuthLayout.tsx       # Centered high-security portal backdrop
├── animations/              # Abstracted motion framer variations
│   ├── fade.ts              # Transition curves
│   ├── ledgerPulse.ts       # Block confirmation pulses
│   └── spinTransition.ts    # Re-hashing verification wheel dynamics
├── services/                # Real API, Blockchain JSON-RPC client services
├── contexts/                # Global React context configurations
│   ├── AuthContext.tsx      # Session, Role permissions, hardware key configurations
│   ├── CaseContext.tsx      # Active workspace trackers
│   └── ThemeContext.tsx     # System theme defaults (Command Slate vs Courtroom Light)
├── constants/               # System limits, agency configurations
├── types/                   # Unified standard TypeScript types & interfaces
│   ├── index.ts             # Export barrel
│   ├── case.ts              # Case structure types
│   ├── evidence.ts          # File properties, hashes, officer identifiers
│   └── blockchain.ts        # Block nodes, transaction logs, parent chains
├── utils/                   # Cryptographic, date, and math helper functions
└── theme/                   # Aesthetic styling definitions, tokens, visual limits
```

---

### 4. Detailed Design for Every Screen

#### 4.1 Login Portal (`/auth/login`)
*   **Purpose**: Secure entry with multi-factor biometric/hardware key confirmation.
*   **Components**:
    *   *System Branding Module*: Centered glowing blue shield icon, corporate serif header font, subtle grid backdrop.
    *   *Input Desk*: Deep slate, thin-bordered inputs for Credentials (Agency Badge ID, PIN).
    *   *Hardware Key Anchor*: Prompt container indicating "Awaiting Secure Cryptographic Key Insertion...".
*   **Buttons**:
    *   `Authorize`: Glassmorphic tactical blue, white label, slow hover transition, scales up slightly (`scale: 1.02`).
*   **Animations**:
    *   Subtle radar scanning ring pulsing behind the shield branding icon.
*   **States**:
    *   *Loading State*: Disables input, renders "Verifying Biometric Handshake..." with a circular glowing blue loading bar.
    *   *Success State*: Visual card slide-up, banner flashes neon green ("AUTHORIZATION SECURED").
    *   *Error State*: Form borders flash neon amber ("ACCESS DENIED: BADGE EXPIRY OR INVALID SIGNATURE").

#### 4.2 Master Console Dashboard (`/console/dashboard`)
*   **Purpose**: Command room panel displaying agency performance metrics, system status, and live ledger data feeds.
*   **Components**:
    *   *Metrics Bento-Grid*: Four statistics modules displaying high-level integrity stats.
    *   *Activity Panel*: Recharts Line graph showcasing Monthly Verification Volume vs Verification Success rate.
    *   *Live Ledger Streams*: A rolling vertical list of real-time block confirmations.
    *   *Security Health Desk*: Real-time node synchronizer status tracker.
*   **Animations**:
    *   New ledger blocks slide-down from top of stream list using spring layout animations (`motion/react`).
*   **States**:
    *   *Loading State*: Shimmering skeletons mimicking the curves of graphs and data values.
    *   *Error State*: Disables stream updates, shows red toast ("Node Connection Latency Detected. Retrying consensus...").

#### 4.3 Case Directory (`/console/cases`)
*   **Purpose**: View, search, filter, and create police cases containing digital files.
*   **Components**:
    *   *Search & Filter Toolbar*: Text input for Case ID, dropdown selectors for Case Status (Active, Archived, Court Hearing), Case Priority (Critical, High, Medium, Low).
    *   *Bento Case Grid*: Cards containing Case Name, Unique ID, assigned Officer ID, total pieces of evidence inside, date modified.
*   **Buttons**:
    *   `Create Case`: Minimal tactical button featuring a plus icon, opens modular form overlay.
*   **Animations**:
    *   Staggered grid entry animation where each case card fades and floats up sequentially.
*   **Empty State**: Centered minimalist slate icon representing empty files, featuring message: "No investigations match filters. Select 'Create Case' to initialize."

#### 4.4 Ingestion Desk (`/console/evidence/upload`)
*   **Purpose**: Cryptographically hashing and securely uploading evidence files.
*   **Components**:
    *   *Dropzone Box*: Massive card with dashed border frame, glowing blueprint pattern, icon of digital vault.
    *   *Hashing Progress Tracker*: Appears below dropzone upon drop. Shows streaming percentage block indicator.
    *   *Form Module*: Dynamic fields (Evidence Category: Video, Image, Log, PDF; Submitting Officer Name; Badge Number; Case Identifier).
*   **Animations**:
    *   Dashed hazard frame borders rotate slowly during hashing.
    *   Success ledger entry card collapses in from the side like a sliding drawer.

#### 4.5 Evidence Detail View (`/console/evidence/:evidenceId`)
*   **Purpose**: Review full parameters, metadata, and history of a specific digital file.
*   **Components**:
    *   *Media Sandbox*: Fully secure web browser video player, document viewer, or audio wave player.
    *   *Technical Parameter List*: Card displaying file dimensions, size, exact system file path, client-calculated SHA-256 hash.
    *   *Ledger Audit Path*: Timeline mapping the exact block, timestamp, gas limit, and miner node confirmation signature.
*   **Buttons**:
    *   `Verify Integrity`: Primary trigger executing local hash comparison.
    *   `Generate Court Report`: Direct access to standard report builder.

#### 4.6 Verification Deck (`/console/verify`)
*   **Purpose**: Drag-and-drop comparison playground to instantly verify evidence files.
*   **Components**:
    *   *Double Dropzone*: Drop any physical file collected during discovery.
    *   *Interactive Ring Indicator*: Large central ring displaying verification status.
*   **Animations**:
    *   *Matching Status*: Ring expands outward with double neon-green waves, a heavy digital lock sound/animation clicks into place, displaying text "MATCH SECURED - INTEGRITY VERIFIED - BLOCK #8812A".
    *   *Mismatch Status*: Ring flashes high-contrast pulsing warning lines, glowing amber-red hazard colors, showing "HASH MISMATCH DETECTED - CASE COMPROMISED - AUDIT REQUIRED".

#### 4.7 Ledger/Blockchain Explorer (`/console/explorer`)
*   **Purpose**: A full visual public index of blocks proving system immutability.
*   **Components**:
    *   *Interactive Block Train*: Horizontal chain sequence of block nodes.
    *   *Block Card Detail Drawer*: Slider module containing structural block elements (nonce, transaction ID, payload metadata, signer key certificate).
*   **Search**: Fully responsive search bar filtering entries by custom hash signatures or block indices.

#### 4.8 Report Generator Suite (`/console/reports`)
*   **Purpose**: Construct exportable, printable documents certifying evidence integrity.
*   **Components**:
    *   *Document Preview Frame*: Styled to mimic standard governmental, federal-grade documents.
    *   *Signature Verification Block*: Fields detailing certificates of the verifying officer and official seals.
*   **Buttons**:
    *   `Print / Export PDF`: Native file system export engine activation.

#### 4.9 User Security & Settings (`/console/settings`)
*   **Purpose**: Node and account administration panel.
*   **Components**:
    *   *FIDO2 Token Desk*: Add physical hardware security keys.
    *   *Node Synchronization Graph*: Display connected local and distributed blockchain validation peers.

---

### 5. Tactical Dashboard Blueprint
The dashboard interface is modeled as a high-density bento grid designed for command centers.

```
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
|  [SHIELD BRAND] CHAINSHIELD COMMAND   [STATUS: ONLINE (4 NODES)]              12-07-2026 23:45:00 UTC    |
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
|  [METRIC: TOTAL EVIDENCE]   [METRIC: INTEGRITY STATUS]  [METRIC: SYNC RATE]     [METRIC: ACTIVE OFFICERS]|
|  142,981 Files              100.00% SECURE              99.98% Healthy          42 Verified Signers      |
+──────────────────────────────────────────────────────────────────────────────────┬───────────────────────+
|  [CHART: WEEKLY INGESTION VS VALIDATION STATUS]                                  | [LIVE LEDGER FEED]    |
|                                                                                  | Block #9981: 0d2f8e...|
|   Ingestion: ██████████████████████████████████████                              | Block #9980: fa4d3c...|
|   Validation: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                             | Block #9979: 772b11...|
|                                                                                  | Block #9978: e99a80...|
|   Mon     Tue     Wed     Thu     Fri     Sat     Sun                            | [View All Blocks ->]  |
+──────────────────────────────────────────────────────────────────────────────────┴───────────────────────+
|  [CRITICAL RECENT CASE WORKSPACES]                                                                       |
|  Case ID #2026-004A  | Grand Theft Auto    | Officer: Det. Miller   | 14 Files Ingested  | Secure        |
|  Case ID #2026-119X  | Cyber Counterfeiting | Officer: Analyst Chen  | 89 Files Ingested  | Secure        |
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

### 6. Case Directory & Workspace Interface
*   **Visual Grid Cards**: Case folders are depicted as high-contrast border grid layouts with glowing blue tags showing priority state (e.g., `PRIORITY: HIGH` in light-blue, `PRIORITY: CRITICAL` in neon orange, `PRIORITY: REGULAR` in slate).
*   **Timeline Element**: Vertical left-aligned bar connecting events. Nodes representing case updates are marked with custom icons:
    *   *Ingestion Event*: File folder with a down-arrow.
    *   *Transfer of Custody Event*: Left-right transfer arrows.
    *   *Court Verification*: Gavel icon.

---

### 7. Evidence Ingestion Module Details
*   **Local Hash Calculations**:
    *   An elegant, technical console overlay blocks other actions during upload.
    *   A monospace counter ticks frantically showing block bytes being read: `READING: 1,402,001 / 2,410,000 BYTES - SHA-256 ENCRYPTING...`.
*   **Ledger Anchoring Phase**:
    *   Once hashing finishes, the files details are locked, and a glowing block component slides into a small ledger chain visualizer to illustrate blockchain block integration.

---

### 8. Evidence Metadata & Detail Page
*   **Sanitized Media Viewer**:
    *   *Video*: Built-in player surrounded by black frames, showing frame-by-frame controls, timestamps, and current frame SHA-256 estimation.
    *   *Documents*: Integrated high-contrast PDF or text renderer with zero external dependencies to prevent XSS.
*   **The ChainShield Certificate Panel**:
    *   A visual cryptographic "card of truth" displaying the full 64-character SHA-256 hash in a large font size inside a box. Users can click to copy the hash.

---

### 9. Interactive Verification Sandbox

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|  EVIDENCE INTEGRITY VERIFICATION PORTAL                                                                 |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                                         |
|       [ DROP FILE TO TEST ]                                       [ THEORETICAL BLOCKCHAIN VALUE ]      |
|                                                                                                         |
|       Drag target courtroom file                                  Database Signature:                   |
|       here to inspect its signature.                              7e4c5b1b4d89a1c...                    |
|                                                                                                         |
|       Calculated Hash:                                            Ledger Status:                        |
|       7e4c5b1b4d89a1c...                                          COMMITTED (Block #10405)              |
|                                                                                                         |
|                                                                                                         |
|                                   +─────────────────────────────+                                       |
|                                   |                             |                                       |
|                                   |       MATCH SECURED!        |                                       |
|                                   |                             |                                       |
|                                   |  This file is identical to  |                                       |
|                                   |  the evidence ingested on   |                                       |
|                                   |  July 12, 2026 22:45:00 UTC |                                       |
|                                   +─────────────────────────────+                                       |
|                                   ( Neon green glowing border )                                         |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

### 10. Chain of Custody (CoC) Timeline Ledger
Every movement, query, or check of a file produces a logged custody record on the blockchain:
*   **Custody Cards**: High-contrast, narrow cards that expand on click.
*   **Action Types**:
    *   `INGESTION` (Green indicator line)
    *   `ACCESS/DOWNLOAD` (Blue indicator line)
    *   `TRANSFERRED` (Amber indicator line)
    *   `COURTROOM CHECK` (Purple indicator line)
*   **Data Fields**: Time (Precise to the millisecond), Officer, Signature ID, Action, Verification Status, Accessing Node IP.

---

### 11. Custom Blockchain Explorer Blueprint
*   **The Block Ribbon**: A horizontal timeline of blocks. Blocks are rectangular modular containers containing:
    *   `Block #88902`
    *   `Timestamp: 2026-07-12 22:45:10`
    *   `Hash: 0a9e8f...`
*   **Linking Wires**: Blocks are linked together with glowing blue or emerald lines, representing cryptographic hash links (i.e., Parent Hash of Block B matches Hash of Block A).
*   **Genesis Block Representation**: The very first block on the timeline is highlighted with a gold emblem border, marked "GENESIS BLOCK: CORE SYSTEM INITIALIZATION".

---

### 12. Courtroom-Grade Reports
*   **Header Section**: Federal agency-style header containing official crest placeholder, department details, and "CRYPTOGRAPHIC INTEGRITY CERTIFICATION" title in classic bold typography.
*   **Body Details**:
    *   *Case Information Table*: Case ID, Investigator, Date of Ingestion, File Name, Original Format, Size.
    *   *Cryptographic Certification Section*: Clean border card housing the SHA-256 hash with signature verification certificate keys.
    *   *Official Stamps*: Digital signature stamps showing status "VERIFIED INTEGRITY SECURED".

---

### 13. System Notifications
System notifications are positioned in the top-right corner, designed as slide-in notifications with glassmorphic backgrounds:
*   **Success Notification**: Neon green left border, checkmark icon ("Block #9420 Mined Successfully - Transaction Confirmed").
*   **Error Notification**: Neon red left border, cross icon ("Verification Failure - Local Hash of 'video_cctv.mp4' does not match Ledger record!").
*   **Warning Notification**: Neon amber left border, alert icon ("Node Synchronization Discrepancy - Connecting to secondary validators").

---

### 14. Frontend Animation Choreography
All transitions utilize high-performance hardware-accelerated CSS animations configured through Framer Motion (`motion/react`):

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    ANIMATION PERFORMANCE MATRIX                                         |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|  Transition Type     | Trigger Event          | Timing  | CSS Properties Modified                       |
+──────────────────────┼────────────────────────┼─────────┼───────────────────────────────────────────────+
|  FADE & SLIDE        | Screen Route Change    | 350ms   | opacity: 0 -> 1, transform: translateY(10px->0)|
|  LEDGER PULSE        | Block Appended         | 800ms   | box-shadow: 0 0 0px -> 15px (glowing sapphire)|
|  TACTICAL ROTATION   | File Hashing Stream    | Infinite| transform: rotate(0deg -> 360deg) (Linear)    |
|  LOCK IN SEQUENCE    | Verification Success   | 500ms   | scale: 0.8 -> 1.05 -> 1.0 (Spring, bounce)    |
|  DRAWER EXPANSION    | Block Card Selected    | 250ms   | width: 0px -> 420px (Ease-in-out)             |
+───────────────────────────────────────────────────────────────────────────────────────────────+
```

---

### 15. Lucide Icon Reference Library

*   **Security & Encryption**: `ShieldCheck`, `Lock`, `Unlock`, `KeyRound`, `Fingerprint`
*   **File Management**: `FileVideo`, `FileImage`, `FileAudio`, `FileText`, `FolderArchive`, `UploadCloud`
*   **System Navigation**: `LayoutDashboard`, `FolderClosed`, `Radio`, `FileSpreadsheet`, `Settings`
*   **Data Verification & Audit**: `SearchCode`, `History`, `CheckCircle2`, `AlertTriangle`, `Activity`

---

### 16. Typography Guidelines
*   **Primary System Font**: **Inter**
    *   *Body Copy*: `14px`, Font Weight `400` (Regular) / `500` (Medium).
    *   *Visual Labels*: `12px`, Font Weight `600` (Semi-Bold), tracking-wider, uppercase.
*   **Display & Title Font**: **Space Grotesk**
    *   *Page Headers*: `28px` or `24px`, Font Weight `700` (Bold), tracking-tight.
    *   *Bento Cards*: `18px`, Font Weight `600` (Medium-Bold).
*   **Data & Cryptographic Font**: **JetBrains Mono**
    *   *Hexadecimal Hashes & Block Keys*: `13px`, Font Weight `500` (Medium), letter-spacing tight.

---

### 17. Tactical Color Palette Spec

```
[ Tactical Dark ]   #0D1117  ■  Main Application Backdrop (Clinical darkness)
[ Command Slate ]   #161B22  ■  Bento Grid Card Surfaces & Module Frames
[ Shield Blue ]     #1F6FEB  ■  Primary Buttons, Focus states, Navigation Anchors
[ Verify Emerald ]  #2EA043  ■  Successful Hashes, Valid blocks, Active Sync
[ Warning Amber ]   #D29922  ■  Mismatched signatures, System errors, Security Alerts
[ Courtroom White ] #F0F6FC  ■  High contrast primary text & Structural lines
[ Forensic Silver ] #8B949E  ■  Secondary metadata, labels, descriptors
```

---

### 18. Responsive Grid Breakpoints

*   **Desktop & Command Displays (1440px and above)**: Full bento-grid layouts with sidebars lock-docked, visual transaction tickers active.
*   **Laptops & Court Desks (1024px - 1439px)**: Columns collapse from three to two. Left vertical navigation menu shrinks to icon-only representation with custom tooltips.
*   **Tablets & Mobile Terminals (768px - 1023px)**: Layout merges into single scroll column. Top-fixed navigation menu replaces the side dock. Hashing calculations utilize localized streaming with background worker states.

---

### 19. Cyber-Grade Accessibility & Security Integration
*   **Interactive Focus Borders**: Standard outline overlays are replaced with a high-contrast glowing `Shield Blue` frame (`outline: 2px solid #1F6FEB; outline-offset: 2px;`) to aid keyboard navigators.
*   **Screen-Reader Hash Dictation**: For users relying on screen-readers, raw 64-character hashes include descriptive aria-labels translating them character-by-character to avoid reading raw strings as unrecognizable words (e.g., `<span aria-label="Cryptographic signature ending in seven echo four Charlie">7e4c</span>`).

---

### 20. End-to-End User Experience Blueprint
The complete system journey represents how a patrol officer ingests a file and defends its integrity inside a courtroom environment:

```
+───────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    CHRONOLOGICAL USER EXPERIENCE FLOW                                     |
+───────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                                           |
|  [STAGE 1: CAPTURE & INGEST]                                                                              |
|  - Officer Miller logs in using their secure credentials and FIDO2 Hardware Key on their tactical tablet. |
|  - Miller creates "Case #2026-99A" (surveillance camera extraction).                                       |
|  - Miller drops 'cctv_backdoor.mov' (350MB) into the dropzone.                                            |
|                                                                                                           |
|  [STAGE 2: LOCAL CRYPTO COMPUTE]                                                                          |
|  - ChainShield instantly reads the file locally, computing the SHA-256 hash block by block.               |
|  - Hash computed successfully: 'ef994d21...'. The file is encrypted using AES-256 and uploaded.           |
|                                                                                                           |
|  [STAGE 3: IMMUTABLE ANCHOR]                                                                              |
|  - The backend server intercepts the hash and timestamps the data.                                        |
|  - A private blockchain transaction is triggered; validation nodes reach consensus.                      |
|  - Block #10420 is generated, sealing the metadata and hash forever.                                      |
|                                                                                                           |
|  [STAGE 4: COURTROOM VALIDATION]                                                                          |
|  - Months later, in court, the prosecutor drags the physical video file into the Verification page.       |
|  - ChainShield calculates the hash of the local file and compares it to Block #10420.                      |
|  - Screen glows a solid, professional green: "MATCH CONFIRMED. INTEGRITY PROVEN."                         |
|                                                                                                           |
+───────────────────────────────────────────────────────────────────────────────────────────────────────────+
```
