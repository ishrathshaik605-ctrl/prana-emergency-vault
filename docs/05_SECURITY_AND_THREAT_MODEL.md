# Deliverable 5: Security Architecture and Threat Model

## 1. Threat Modeling (STRIDE / Health-Tech Matrix)

In emergency health-tech, security models must navigate a fundamental tension: **a security system that blocks an ER doctor during acute trauma can cause patient death**, while a completely open system destroys patient privacy. Below is the formal threat model with specific mitigations implemented in AapatVault.

| Threat Category | Attack Vector / Scenario | Threat Actor | Impact Severity | AapatVault Architectural Mitigation |
|---|---|---|---|---|
| **Impersonation** | An attacker attempts to guess or brute-force an OTP to pose as a family guardian. | Malicious Actor / Identity Thief | **High** | 1. Rate-limiting (max 3 attempts per phone per 15 min).<br>2. OTPs expire in 5 minutes with SHA-256 salted hashes.<br>3. Access is locked exclusively to pre-registered family phone numbers. Unregistered numbers are rejected with HTTP 403. |
| **Coerced Access** | An attacker coerces the owner to unlock their phone or view sensitive records. | Extortionist / Abuser | **Medium-High** | 1. Duress PIN support: entering an alternate panic PIN unlocks a decoy Tier 0 card while quietly alerting guardians.<br>2. Tier 0 never displays home addresses or financial assets.<br>3. Immediate revocation killswitch available from any registered guardian device. |
| **Stolen Device / Physical Theft** | An attacker steals the owner's phone or wallet card. | Street Thief / Prowler | **Medium** | 1. The physical wallet card and lock screen contain **ONLY Tier 0** data (Blood Group, Allergies, Top 2 Contacts).<br>2. All insurance policy numbers, medications, IDs, and documents are encrypted with AES-256-GCM and stored server-side.<br>3. Zero private data can be harvested from a stolen wallet card. |
| **Insider Misuse / Rogue Responder** | A hospital employee or rogue paramedic triggers Break-Glass to snoop on a celebrity or acquaintance. | Rogue Healthcare Worker | **High** | 1. **Immediate Broadcast Whistleblower**: Break-Glass triggers an automated SMS and automated voice IVR call to all registered family members within 2 seconds, displaying the responder's name, badge number, hospital, and clinical reason.<br>2. **Immutable Forensic Audit**: Tamper-evident logging records IP, GPS coords, badge ID, and exact categories unlocked.<br>3. **30-Minute Self-Destruct**: Break-glass sessions automatically expire in 30 minutes.<br>4. 1-Tap "Report Abuse / Revoke" button allows family to kill the session instantly. |
| **Data Scraping / QR Crawlers** | Automated bots crawling public URLs to scrape citizen health data. | Web Crawlers / Data Brokers | **Medium** | 1. Cryptographically generated random Vault IDs (e.g. `AV-8842X`) prevent sequential enumeration.<br>2. Aggressive IP rate-limiting (max 60 queries/min per IP).<br>3. Tier 0 exposes zero government ID numbers (no Aadhaar, PAN, SSN) and zero commercial marketing data. |

---

## 2. Explicit Architectural Trade-Offs

### Speed vs Security at Break-Glass
- **The Trade-Off**: Requiring multi-party consensus (e.g., waiting for 2 family members to approve an access request) provides higher security against rogue responders, but **in an acute emergency where family is asleep or uncontactable, a 3-minute delay causes brain death or irreversible shock**.
- **The Design Decision**: We prioritize **Speed at Access, Accountability in Post-Audit**. Tier 2 grants instant 2-second access upon submission of official credentials, but offsets this risk by immediately broadcasting loud, multi-channel alerts to the family and recording an immutable forensic log.

### Offline Resilience vs Real-Time Revocation
- **The Trade-Off**: Encoding blood group and critical allergies into the printed physical QR code guarantees life-saving offline access in remote rural areas with zero cellular reception, but **printed QR data cannot be dynamically revoked once printed**.
- **The Design Decision**: We partition data strictly:
  - **Offline QR Encoded**: Name, Blood Group, Critical Allergies, Top 2 Emergency Contact phone numbers. (Non-sensitive life-saving data).
  - **Server-Only Dynamic Decryption**: Medications, Diagnoses, Insurance, Financials, Home Address, and Document Scans.

---

## 3. Regulatory & Compliance Mindset

### India Digital Personal Data Protection (DPDP) Act 2023
AapatVault is engineered to satisfy the core pillars of the DPDP Act 2023:
1. **Notice & Explicit Consent**: During vault setup, clear, plain-language consent disclosures specify the exact purpose of emergency access.
2. **Right to Access & Review**: Vault owners can inspect the full plain-language audit history of every individual who viewed their vault.
3. **Right to Correction & Update**: Owners can update medications, allergies, and emergency contacts at any time.
4. **Right to Data Portability**: 1-Tap complete JSON export (`/api/vault/:id/export`) allowing citizens to take their emergency health records to any other platform.
5. **Right to Erasure (Forget Me)**: Permanent deletion (`/api/vault/:id/delete`) that strips and purges all database records, documents, contacts, and audit logs.
6. **No Monetization / No Ads**: Strict zero-brokerage policy. User health data is never sold, shared, or targeted for advertising.

### ABDM / ABHA Alignment Path
- Designed to integrate with India's **Ayushman Bharat Digital Mission (ABDM)**.
- In v3, the 14-digit **ABHA ID (Ayushman Bharat Health Account)** will link to the vault via the Unified Health Interface (UHI) / M1-M3 milestones, allowing hospital admission desks to automatically verify PMJAY / ABHA health insurance schemes seamlessly.
