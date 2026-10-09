# Deliverable 1: Problem Framing and User Personas

## 1. Executive Summary & Problem Framing

In acute health emergencies—such as road traffic accidents, sudden cardiac arrests, strokes, or diabetic hypoglycemia—the **"Golden Hour"** (the first 60 minutes) and especially the **"Platinum 10 Minutes"** determine survival versus mortality or permanent disability. 

Today, critical patient information is trapped behind an **Access Paradox**:
1. **The "All-or-Nothing" Dilemma**: Existing medical alert apps either publish everything in plaintext (leaking HIV status, home addresses, Aadhaar/SSN numbers, and psychiatric history to curious bystanders) or lock everything behind a password/biometric face-unlock that an unconscious or comatose patient cannot open.
2. **The Incapacitated Owner Dilemma**: No existing platform enables a verified family member across town or a paramedic on-scene to act legally and clinically on behalf of an incapacitated person without prior physical access to the patient's unlocked device.
3. **The Panic Factor**: Bystanders and family members experience extreme cognitive overload during accidents. Complex authentication forms, multiple dropdown menus, or unreadable fine print lead to complete task abandonment.
4. **The Demographic Divide**: India and emerging economies have hundreds of millions of low-literacy adults, elderly citizens with motor tremors, and feature-phone users who cannot navigate multi-step smartphone UI wizards.

### Core Value Proposition: Controlled Access at the Moment of Need
**AapatVault** solves this with a **Tiered Cryptographic Access Matrix**:
- **Tier 0 (Public Lifesaver Card)**: Instant 0-second access via physical QR / NFC / lock screen. Zero sensitive leakage. Exposes ONLY blood group, critical allergies, immediate lifesaving instructions, and top 2 ranked emergency contacts with 1-tap call triggers.
- **Tier 1 (Verified Family Member)**: Fast OTP verification sent to pre-registered phone numbers. Delivers owner-customized granular permission slices (e.g. medications, cashless health insurance policy numbers, doctor contacts, discharge reports).
- **Tier 2 (Emergency Responder Break-Glass)**: Allows paramedics and ER trauma doctors to break-glass within 2 seconds using their official badge/organization ID and clinical reason. Automatically time-limited (30 minutes), cryptographically logged in an immutable audit ledger, and immediately blasts out real-time multi-channel SMS & automated IVR phone alerts to all family guardians with an instant revocation killswitch.

---

## 2. Detailed User Personas

### Persona 1: Ramesh Patel (The Non-Literate / Low-Literacy Rural Elder)
- **Age**: 68 | **Location**: Mogar Village, Anand District, Gujarat, India.
- **Occupation**: Semi-retired farmer.
- **Device**: Basic keypad feature phone (JioBharat 4G); relies on his son for smartphone tasks.
- **Health Profile**: Blood Group **B+ve**, Type-2 Diabetes (prone to severe hypoglycemic fainting), Hypertension, Dual-Chamber Pacemaker implanted in 2021 (MRI conditional).
- **Critical Risk**: **Severe Penicillin Allergy** (risk of fatal anaphylactic shock if an ER doctor administers routine antibiotic injections).
- **Literacy & Usability Needs**: Cannot read English; basic Gujarati reading; heavily reliant on pictorial iconography (red cross, telephone, heart symbol) and voice readout.
- **Emergency Scenario**: Suffers sudden hypoglycemia and collapses near a rural highway bus stop while traveling alone.
- **How AapatVault Solves for Ramesh**:
  - Wears a laminated **AapatVault Wallet Card** in his kurta pocket and has a **Helmet Sticker** on his scooter.
  - The offline QR code embeds his name, B+ve blood group, Penicillin allergy warning, and son Suresh's phone number directly in the QR string—requiring zero cellular data or server connectivity.
  - Any rural bystander or 108 ambulance EMT scans the card and instantly sees the giant red allergy banner and taps "Call Son".
  - If a bystander only has a basic phone, texting `HELP AV-8842` or dialing `*999*AV-8842#` receives an instant SMS response with lifesaver details.

---

### Persona 2: Priya Sharma (The Tech-Savvy Urban Professional)
- **Age**: 29 | **Location**: Bengaluru, Karnataka, India.
- **Occupation**: Senior Software Engineer.
- **Device**: iPhone 15 / Android flagship; heavy digital wallet user.
- **Health Profile**: Blood Group **O-ve** (rare universal donor blood), severe **Sulfa Drug Allergy**, exercise-induced asthma (carries inhaler in bag), titanium bone plate in left ankle.
- **Key Pain Point**: Extremely privacy-conscious. Refuses to display her home address, PAN card, or personal prescriptions openly on her lock screen, but needs ER doctors to know her O-ve blood type and insurance policy for cashless admission.
- **Emergency Scenario**: Scooter collision in heavy city traffic; concussion renders her unconscious.
- **How AapatVault Solves for Priya**:
  - Her phone lock screen wallpaper features an AapatVault emergency badge and QR code.
  - Paramedic from 108 GVK EMRI scans the lock screen:
    - Tier 0 instantly shows O-ve blood group and Sulfa allergy.
    - EMT uses Tier 2 Break-Glass with badge number and "head trauma" reason to unlock her HDFC ERGO cashless policy number and emergency contact list in 2 seconds.
    - Priya's brother Rahul in Delhi instantly receives an automated SMS and IVR phone call notifying him of the exact hospital and trauma reason.

---

### Persona 3: Suresh Patel (The Panicking Family Member Under Stress)
- **Age**: 38 | **Location**: Anand, Gujarat.
- **Relationship**: Son and designated primary guardian for Ramesh Patel.
- **Psychological State**: Panicked, hands trembling after receiving a call that his father collapsed. Sitting in an auto-rickshaw rushing to the hospital.
- **Task**: The hospital reception demands the father's Star Health Senior Citizen policy number and pacemaker implant card within 60 seconds for cashless admission.
- **Usability Challenge**: Cannot remember complex passwords or navigate nested app settings under panic.
- **How AapatVault Solves for Suresh**:
  - Suresh opens the emergency link on his phone, enters his registered phone number, receives a 6-digit OTP, and taps "Verify".
  - Within 3 seconds, Tier 1 unlocks his father's insurance card, policy number, TPA helpline, and downloaded cardiac discharge report.

---

### Persona 4: EMT Anita Rao & Dr. Rajesh Mehta (The First Responders / ER Trauma Team)
- **Role**: 108 Ambulance Paramedic & Emergency Department Resident.
- **Context**: Moving ambulance with sirens blaring, patient unconscious, unstable vitals.
- **Usability Need**: Cannot waste 5 minutes creating an account or waiting for an OTP approval from a family member who is asleep or not answering.
- **Time Window**: Less than 30 seconds to identify allergies before pushing intravenous medications.
- **Accountability Need**: Hospital protocol requires logging why clinical records were accessed without patient consent.
- **How AapatVault Solves for First Responders**:
  - EMT Anita points her smartphone or rugged tablet camera at the patient's wallet card or helmet sticker.
  - Instantly sees Tier 0 (B+ve, NO PENICILLIN, Pacemaker present).
  - Taps "Emergency Responder Break-Glass", enters EMT ID and "Acute Trauma", and unlocks the full medication schedule and pacemaker specifications.
  - System logs her badge number and location, simultaneously notifying the family.
