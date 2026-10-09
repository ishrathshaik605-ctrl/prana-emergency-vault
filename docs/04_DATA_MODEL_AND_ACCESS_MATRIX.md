# Deliverable 4: Data Model and Access-Control Rules

```mermaid
erDiagram
    USERS ||--o{ VAULTS : owns
    VAULTS ||--o{ EMERGENCY_CONTACTS : contains
    VAULTS ||--o{ INSURANCE_DETAILS : covers
    VAULTS ||--o{ DOCUMENTS : stores
    VAULTS ||--o{ ACCESS_PERMISSIONS : grants
    VAULTS ||--o{ ACCESS_LOGS : records
    VAULTS ||--o{ OTPS : verifies
    VAULTS ||--o{ NOTIFICATIONS_QUEUE : dispatches
    VAULTS ||--o{ INCIDENT_HISTORY : logs

    USERS {
        string id PK
        string phone UK
        string name
        string pin_hash
        string role
        datetime created_at
    }

    VAULTS {
        string id PK "e.g. AV-8842"
        string owner_id FK
        string owner_name
        string dob
        string gender
        string blood_group "O+ve, B+ve, etc."
        string allergies_enc "AES-256-GCM"
        string conditions_enc "AES-256-GCM"
        string medications_enc "AES-256-GCM"
        string implants_enc "AES-256-GCM"
        int organ_donor "1 or 0"
        string primary_doctor_enc "AES-256-GCM"
        string doctor_phone_enc "AES-256-GCM"
        string hospital_name
        string hospital_address
        string home_address_enc "AES-256-GCM"
        string emergency_instructions_enc "AES-256-GCM"
        string voice_note_url
        string offline_qr_payload "Base64 Compact"
        int is_locked
        datetime created_at
        datetime updated_at
    }

    EMERGENCY_CONTACTS {
        string id PK
        string vault_id FK
        string name
        string relationship
        string phone
        int priority "1, 2, 3"
        int notify_on_access
        int can_authorize_tier1
    }

    INSURANCE_DETAILS {
        string id PK
        string vault_id FK
        string provider
        string policy_number_enc "AES-256-GCM"
        string tpa_name
        string cashless_helpline
        string expiry_date
        string policy_document_url
        string notes_enc "AES-256-GCM"
    }

    ACCESS_PERMISSIONS {
        string id PK
        string vault_id FK
        string grantee_phone
        string grantee_name
        string relationship
        string role "primary_guardian / family"
        string allowed_categories "JSON Array"
        int requires_approval
    }

    ACCESS_LOGS {
        string id PK
        string vault_id FK
        string actor_type "public_scanner / verified_family / break_glass_responder"
        string actor_identifier "Phone or EMT Badge"
        string actor_name
        string actor_org
        string reason
        string tier_accessed "Tier 0 / Tier 1 / Tier 2"
        string categories_unlocked "JSON Array"
        string ip_address
        string user_agent
        float location_lat
        float location_lng
        string location_address
        datetime session_expires_at "30-min window"
        string status "active / expired / revoked / flagged_abuse"
        string revoked_by
        datetime revoked_at
        datetime timestamp
    }
```

---

## Access-Control Matrix (Tier & Permission Policy)

| Data Category | Tier 0: Public Lifesaver (Bystander/QR) | Tier 1: Verified Family (SMS OTP) | Tier 2: Break-Glass Responder (EMT/ER) | Vault Owner (PIN/Biometric) |
|---|:---:|:---:|:---:|:---:|
| **Patient Full Name** | Visible | Visible | Visible | Visible |
| **Blood Group** | **Visible (Plain)** | Visible | Visible | Visible |
| **Critical Allergies (Anaphylaxis Risk)** | **Visible (Decrypted)** | Visible | Visible | Visible |
| **Immediate Lifesaving Conditions** | **Visible (Decrypted)** | Visible | Visible | Visible |
| **Organ Donor Status** | Visible | Visible | Visible | Visible |
| **Emergency Contacts (Top 2)** | Visible with `tel:` links | Visible | Visible | Visible |
| **All Emergency Contacts (Ranked)** | Masked (Top 2 only) | **Visible** | Visible | Visible |
| **Emergency Instructions (Summary)** | Visible | Visible | Visible | Visible |
| **Full Daily Medications & Dosages** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | **Visible (Clinical)** | Visible |
| **Implants & Pacemaker Details** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | **Visible (MRI Safety)** | Visible |
| **Doctor Phone & Contacts** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | **Visible** | Visible |
| **Health Insurance Policy Number & TPA** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | **Visible (Cashless)** | Visible |
| **Medical Documents (Rx, Echo, Lab Scans)**| ❌ **DENIED / MASKED** | **Conditional (Matrix)** | **Visible (Medical Only)**| Visible |
| **Home Address & Residence Location** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | ❌ **DENIED / MASKED** | Visible |
| **Legal & Non-Clinical Documents** | ❌ **DENIED / MASKED** | **Conditional (Matrix)** | ❌ **DENIED / MASKED** | Visible |
| **Incident Audit Logs & Revocation** | ❌ **DENIED** | ❌ **DENIED** | ❌ **DENIED** | **Full Admin Control** |

---

## Architectural Principles & Security Enforcement

### 1. Strict Deny-by-Default
Any data field or category that is not explicitly whitelisted for a tier or authorized family member is automatically purged before transmission to the client. The server-side sanitizer (`accessControl.js`) operates at the database query layer, ensuring sensitive ciphertext is never even decrypted if the requester's permission mask lacks the category.

### 2. Least-Privilege Granular Slicing
In Tier 1, each family member is granted an independent category array:
```json
[
  "medical_basics",
  "medications",
  "doctor_contacts",
  "insurance",
  "documents",
  "home_address",
  "emergency_instructions",
  "incident_history"
]
```
For example, an owner may grant their son full access including `home_address` and `insurance`, but grant a trusted neighbor only `medical_basics` and `emergency_instructions`.

### 3. Field-Level AES-256-GCM Encryption
Sensitive personal and clinical data at rest are encrypted with **AES-256 in Galois/Counter Mode (GCM)**:
- **IV**: 12-byte cryptographically secure random bytes per field.
- **Auth Tag**: 16-byte authentication tag guaranteeing integrity and tamper detection.
- **Payload Format**: `enc:v1:<base64-iv>:<base64-tag>:<base64-ciphertext>`.
- **Key Separation**: The master encryption key is isolated from database backups and application storage.
