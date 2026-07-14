# ChainShield 🔒

### Secure Digital Evidence & Chain of Custody Platform
*A Court-Admissible, High-Fidelity Forensic Integrity Ledger Prototype*

---

## 📌 Project Overview
**ChainShield** is an advanced full-stack digital forensics and evidence-management platform designed to guarantee the mathematical integrity of evidence from ingestion to courtroom presentation. By leveraging local cryptographic SHA-256 fingerprinting, a custom Proof-of-Authority (PoA) blockchain simulation, and an automated Chain of Custody audit log, ChainShield ensures that digital assets—such as surveillance videos, audio recordings, documents, and system logs—cannot be modified or tampered with without immediate, transparent detection.

> **⚠️ Critical Forensic Distinction:** 
> ChainShield does **NOT** determine whether raw evidence is "genuine" or "manipulated" prior to entry. Instead, it guarantees **cryptographic integrity and immutability after evidence has been accepted into custody**. Authenticity is verified separately by forensic experts; ChainShield locks that authenticity mathematically so it remains unassailable.

---

## 🛑 The Core Problem & Our Solution

### The Problem
In modern criminal trials, the defense frequently challenges the admissibility of digital evidence by alleging tampering or a broken chain of custody. Standard storage servers allow administrators to silently replace, alter, or delete files, leaving no audit trail.
- **Data Alteration**: Modifying EXIF metadata, timestamps, or image content.
- **Undocumented Access**: Files downloaded or reviewed without logged custody sign-offs.
- **Spoofing**: Replacing evidence items with corrupted duplicates.

### Our Solution
ChainShield establishes an **unbroken mathematical chain of trust**:
1. **SHA-256 Ingestion Seal**: Every file is immediately hashed at the moment of ingestion.
2. **Blockchain Block Anchoring**: The file hash is linked with previous block hashes in a decentralized linked ledger.
3. **Custody Audit Logging**: Every view, download, transfer, or court verification generates a cryptographic transaction hash.
4. **Instant Verification engine**: Judges and attorneys can drag-and-drop any evidence file to verify its live SHA-256 hash against the immutable ledger record in real-time.

---

## 🏗️ System Architecture & Workflow

```
                        +---------------------------------------+
                        |      React 19 (Vite) Frontend         |
                        +---------------------------------------+
                                            |
                                  HTTPS Rest Queries
                                            v
                        +---------------------------------------+
                        |     Node.js Express Backend           |
                        +---------------------------------------+
                                            |
                +---------------------------+---------------------------+
                |                                                       |
                v                                                       v
+-------------------------------+                       +-------------------------------+
|     Supabase API & Auth       |                       |   Cryptographic Engine        |
|  - PostgreSQL Database        |                       |   - SHA-256 Hash Generator    |
|  - Storage Buckets (Assets)   |                       |   - Proof-of-Authority (PoA)  |
|  - Session Token Validator    |                       |     Blockchain Simulation     |
+-------------------------------+                       +-------------------------------+
                |                                                       |
                +---------------------------+---------------------------+
                                            v
                        +---------------------------------------+
                        |      Unified Admissibility Report      |
                        +---------------------------------------+
```

### Technical Workflow
1. **Acquisition**: An officer uploads digital evidence (e.g., bodycam footage) through the ChainShield portal.
2. **Fingerprinting**: The system calculates the SHA-256 hash of the binary file stream.
3. **Consensus Anchoring**: The backend creates a new ledger block detailing:
   $$\text{Block Hash} = \text{SHA-256}(\text{Block Number} + \text{Previous Block Hash} + \text{Evidence SHA-256} + \text{Timestamp})$$
4. **Storage**: The asset is saved to Supabase Storage, while metadata and the blockchain state are persisted in Supabase PostgreSQL (falling back to a high-fidelity in-memory SQLite state if offline).
5. **Courtroom Validation**: A defense attorney or judge drops the file into the `Verify` interface. The system matches the current file hash against the blockchain ledger. If they match, a certified printable court report is generated.

---

## 🌟 Key Product Features

### 1. Centralized Command Dashboard 📊
- Real-time telemetry indicators tracking server uptime, active blockchain block heights, active cases, and courtroom audits.
- Live-updating ticker stream showing new blocks mined on the network.
- Interactive custom SVG charts illustrating evidence ingestion volume and daily transaction logs.

### 2. Case Locker Management 📁
- High-fidelity folder explorer displaying active investigations, officer assignments, custody badges, and priority indicators.
- Instant overview of case evidence inventories.

### 3. Secure File Upload Portal 📤
- Advanced drag-and-drop interface supporting modern file-type restrictions (videos, audio, photos, documents).
- Real-time, instant client-side SHA-256 calculation so files are fingerprint-sealed before they hit network paths.

### 4. Interactive Ledger Explorer ⛓️
- Fully featured blockchain block explorer with custom search and filtering.
- Visual display of block parameters: `Block Number`, `Previous Hash`, `Current Hash`, `Timestamp`, and `Mined By (Node Validator)`.

### 5. Multi-Tab Court Certification Reports 🖨️
Generate professional, print-ready, CSS-styled, certified reports for four forensic use cases:
- **Case Docket Summary**: Full inventory of evidence items under a specific investigation docket.
- **Evidence Cryptographic Lock Certificate**: Single-asset mathematical certificate showing hash verification status, consensus logs, and device EXIF metrics.
- **Chain of Custody Event Log**: Complete history of transfers, courtroom presentations, and views of a specific file.
- **Blockchain Consensus Audit**: Global status overview showing that all blocks remain perfectly matched and unaltered.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide React (for uniform iconographies).
- **Backend**: Node.js, Express, Multer (for secure file-stream parsing), Esbuild (for production-ready fast bundling).
- **Database / Infrastructure**: Supabase Auth, Supabase PostgreSQL, Supabase Storage, Prisma ORM.
- **Cryptographic Core**: SHA-256 (Node `crypto` library server-side, client-side File-Reader web APIs).

---

## 📊 Pre-Loaded Hackathon Datasets
ChainShield comes pre-seeded with a massive, high-fidelity mock dataset consisting of:
- **15 Active Investigating Officers** with verified badge indexes.
- **50 Active Case Lockers** spanning Critical, High, and Medium priority levels.
- **150 Unique Forensic Evidence items** complete with valid SHA-256 hashes, file sizes, and EXIF devices.
- **150 Linked Blockchain Blocks** forming a consistent, mathematically sound chain.
- **300 Chain of Custody Audit logs** showing ingestion events, downloads, and court verifications.

---

## 🏁 Step-by-Step Demo Flow (For Hackathon Judges)

Follow this precise 3-minute script to demonstrate ChainShield's end-to-end functionality to judging panels:

### Step 1: Demonstrate Dashboard & Telemetry
1. Open the **Dashboard**. Note the active stats cards showing **150 Files** in custody, block heights up to **#150**, and the live block ticking stream on the right.
2. Observe the custom SVG ingestion graph demonstrating live-updating chronological data.

### Step 2: Ingest a New Forensic Asset
1. Click **"Ingest Evidence"** in the navigation bar.
2. Select or drag-and-drop a sample image/video.
3. Observe how the system immediately calculates the SHA-256 hash client-side (visible in the input form before submission).
4. Select a Case Docket (e.g., `CASE-001`) and click **"Upload & Anchor on Ledger"**.
5. Observe the success animation and notification alert indicating a new block has been mined on the Chain of Custody ledger.

### Step 3: Explore the Immutable Blockchain
1. Navigate to **"Ledger Explorer"**.
2. See the newly added block at the top of the stream.
3. Search for the file name or Case ID in the search bar to show instant filtering. Note how each block is linked to its predecessor via the `Previous Hash` pointer.

### Step 4: Verify Evidence Integrity (Courtroom Proof)
1. Go to the **"Verify Evidence"** tab.
2. Drag-and-drop the same file you just uploaded. The engine recalculates the SHA-256 and compares it to the blockchain ledger.
3. The system will display a **"VERIFIED: 100% SECURE"** screen showing the block coordinates, verifying the file has not been altered by even one bit.
4. Now, mock a tampering event by entering a single extra character in the text representation or testing a modified mock asset. Show the **"TAMPERED: SECURITY ALERT"** screen, demonstrating that modifications are caught immediately.

### Step 5: Export Certified Court Docket
1. Navigate to **"Reports"**.
2. Select the case you uploaded to.
3. Toggle between the **Case Docket Summary**, the **Evidence Lock Certificate**, the **Custody Chain Log**, and the **Blockchain Audit**.
4. Click **"Print Certified Report"**. The system automatically triggers the native print dialog, formatting the report into a clean, minimalist, high-contrast, black-and-white layout with official signatures and badge seals.

---

## ❓ Expected Judge Questions & Answers

**Q1: How does this simulation differ from a real blockchain deployment?**
> *A:* In a real-world deployment, the hashing and consensus validation are handled by decentralized validator nodes (using hyperledger or private Ethereum clusters). For this high-fidelity prototype, we simulate the Proof-of-Authority consensus algorithm server-side with an active node list. However, the cryptographic calculations (SHA-256) are completely real.

**Q2: Can someone modify the database and update the hashes there to cover up tampering?**
> *A:* No. Because each block contains the hash of the *previous* block, modifying a single file's hash would invalidate that block's hash. This forces a cascade of failures, invalidating every subsequent block in the chain. Unless the attacker possesses the private keys of the majority of validator nodes to re-mine the entire chain, any tampering remains instantly visible.

**Q3: How does storing files in Supabase Storage remain secure?**
> *A:* The raw binary files are stored in access-restricted buckets. Even if a storage administrator somehow hacked the server and directly replaced a bodycam video file in storage, the *Verify* screen would recalculate the file's hash upon courtroom retrieval, detect a mismatch against the immutable ledger hash, and alert the judge.

**Q4: Does ChainShield support GDPR/Right-to-be-Forgotten laws regarding digital evidence?**
> *A:* ChainShield is designed for law enforcement and official judicial records, which are legally exempt from standard GDPR deletion requests. However, we preserve privacy by storing only cryptographic file hashes on the immutable blockchain, while storing case details in the relational database, allowing compliant data redactions when necessary without breaking the cryptographic chain structure.

---

## 🔒 License
ChainShield is released under the **MIT License**. Created as a prototype for secure digital forensic administration.
