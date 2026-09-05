# Skillproof Person 2 - System Architecture

## 🏗️ High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    SKILLPROOF VERIFICATION SYSTEM                  │
│                    Person 2: Trust Infrastructure                  │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────────────────────────┐
│   PERSON 1      │────────>│   VERIFICATION ENGINE (Person 2)    │
│  Ingestion &    │         │                                     │
│  AI Pipeline    │         │  • SHA-256 Ledger                  │
│                 │         │  • SMS Verification                 │
│  Sends:         │         │  • Vision AI Pipeline               │
│  - Worker phone │         │  • Trust Calculation                │
│  - Audio URL    │         │                                     │
│  - Skills       │         └─────────────────────────────────────┘
│  - Client phone │                        │
│  - Photos       │                        │
└─────────────────┘                        │
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │   PERSON 3       │  │   PERSON 4       │  │   DATABASE       │
         │   Frontend       │  │   FinTech        │  │   PostgreSQL     │
         │                  │  │                  │  │                  │
         │ Gets:            │  │ Gets:            │  │ Stores:          │
         │ - Verification   │  │ - Trust metrics  │  │ - All records    │
         │ - QR codes       │  │ - Credit scores  │  │ - Verifications  │
         │ - Trust tier     │  │ - Worker data    │  │ - Hash ledger    │
         └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        COMPLETE FLOW                               │
└────────────────────────────────────────────────────────────────────┘

Step 1: INGESTION (Person 1 → Person 2)
────────────────────────────────────────
POST /api/verify/create
{
  workerPhone: "+256...",
  audioUrl: "https://...",
  extractedSkills: [...],
  clientPhone: "+256...",
  photos: [...]
}
           │
           ▼
Step 2: HASH GENERATION
────────────────────────
• Generate component hashes
  - Audio hash
  - Photos hash (pHash for duplicates)
  - Metadata hash
• Combine with salt
• Generate SHA-256
• Create QR code
           │
           ▼
Step 3: DATABASE STORAGE
────────────────────────
• Create SkillRecord
• Create HashLedger
• Create PhotoEvidence
• Initialize TrustMetrics
           │
           ▼
Step 4: SMS VERIFICATION (Async)
─────────────────────────────────
POST /api/verify/sms
• Send SMS to client
• "Did [Worker] do [Skill]?"
• Wait for response
           │
           ▼
Step 5: CLIENT RESPONDS
────────────────────────
POST /api/webhook/sms (from Africa's Talking)
• Client replies "YES" or "NO"
• Update verification status
• Recalculate trust metrics
           │
           ▼
Step 6: PHOTO FORENSICS (Async)
────────────────────────────────
POST /api/image/process
• Extract EXIF metadata
• Check GPS coordinates
• Generate pHash
• Detect duplicates
• Calculate validity score
• Flag fraud indicators
           │
           ▼
Step 7: TRUST CALCULATION
──────────────────────────
• Verification ratio (40%)
• SMS confirmation (30%)
• Photo validity (20%)
• Volume bonus (10%)
• Assign trust tier: Gold/Silver/Bronze
           │
           ├─────────────────────┐
           ▼                     ▼
Step 8a: FRONTEND HANDOFF  Step 8b: FINTECH HANDOFF
─────────────────────────  ──────────────────────────
GET /api/verify/record/ID  GET /api/workers/ID/fintech
• Complete verification    • Trust metrics
• QR codes                 • Credit scores
• Trust badges             • Recent activity
• Evidence                 • Verification ratios
```

---

## 📦 Component Architecture

```
src/
├── services/              # Business Logic Layer
│   ├── hashService.ts     • SHA-256 generation
│   │                      • QR code creation
│   │                      • Hash verification
│   │
│   ├── smsService.ts      • SMS dispatch
│   │                      • Webhook processing
│   │                      • Verification tracking
│   │
│   ├── imageService.ts    • EXIF extraction
│   │                      • pHash generation
│   │                      • Duplicate detection
│   │                      • Fraud analysis
│   │
│   └── trustService.ts    • Trust calculation
│                          • Credit scoring
│                          • Tier assignment
│
├── controllers/           # Request Handlers
│   ├── verificationController.ts
│   ├── smsController.ts
│   ├── imageController.ts
│   └── (handles HTTP logic)
│
├── routes/                # API Endpoints
│   ├── verificationRoutes.ts
│   ├── smsRoutes.ts
│   ├── webhookRoutes.ts
│   ├── imageRoutes.ts
│   ├── qrRoutes.ts
│   └── workerRoutes.ts
│
├── middlewares/           # Cross-Cutting Concerns
│   ├── errorHandler.ts    • Global error handling
│   └── logger.ts          • Request logging
│
├── utils/                 # Utilities
│   └── db.ts              • Database client
│                          • Connection management
│
└── types/                 # TypeScript Definitions
    └── index.ts           • Shared interfaces
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE TABLES                         │
└─────────────────────────────────────────────────────────────┘

Worker
├── id (UUID)
├── phone (unique)
├── name
├── email
└── timestamps

SkillRecord
├── id (UUID)
├── workerId (FK → Worker)
├── audioUrl
├── audioHash
├── skills (JSON)
├── clientPhone
├── verificationStatus
├── sha256Hash (unique)
└── timestamps

PhotoEvidence
├── id (UUID)
├── recordId (FK → SkillRecord)
├── photoUrl
├── hasEXIF
├── cameraMake, cameraModel
├── capturedAt
├── latitude, longitude, altitude
├── pHash (for duplicates)
├── isDuplicate
├── fraudFlags (array)
├── validityScore
└── timestamps

SMSVerification
├── id (UUID)
├── recordId (FK → SkillRecord)
├── clientPhone
├── messageId
├── status (sent/confirmed/denied)
├── confirmationCode
├── clientResponse
└── timestamps

HashLedger
├── id (UUID)
├── recordId (FK → SkillRecord, unique)
├── sha256Hash (unique)
├── audioHash, photosHash, metadataHash
├── qrCodeUrl, qrCodeData
├── verificationUrl
├── accessCount
└── timestamps

TrustMetrics
├── id (UUID)
├── workerId (FK → Worker, unique)
├── totalRecords
├── verifiedRecords
├── verificationRatio
├── trustTier
├── trustScore
├── creditScores (volume, verification, validity, repeat)
└── timestamps

ClientConfirmation
├── id (UUID)
├── clientPhone
├── workerPhone
├── confirmationType
├── confirmed
├── rating
└── timestamps
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: CRYPTOGRAPHIC IMMUTABILITY
────────────────────────────────────
• SHA-256 hashing (256-bit)
• Salt-based hash strengthening
• Component-level hashing
• Collision detection
• Immutable ledger (no updates)

Layer 2: VERIFICATION TRIANGULATION
────────────────────────────────────
• SMS customer confirmation
• Human-in-the-loop verification
• 4-digit PIN codes
• 24-hour expiration
• Webhook authenticity

Layer 3: FORENSIC VALIDATION
────────────────────────────
• EXIF metadata verification
• GPS coordinate validation
• Duplicate photo detection (pHash)
• Fraud flag system
• Validity scoring

Layer 4: DATA INTEGRITY
───────────────────────
• Database constraints
• Foreign key relationships
• Unique indexes
• Transaction support
• Automatic rollback

Layer 5: APPLICATION SECURITY
──────────────────────────────
• Input validation
• Error handling
• Environment variables
• Secure webhook endpoints
• (JWT auth planned for production)
```

---

## 🌐 API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API STRUCTURE                           │
└─────────────────────────────────────────────────────────────┘

Express Server (port 3000)
    │
    ├── Middleware Layer
    │   ├── CORS
    │   ├── JSON Parser
    │   ├── Request Logger
    │   └── Error Handler
    │
    ├── Public Routes
    │   ├── GET /health
    │   └── GET / (API docs)
    │
    ├── Verification API
    │   ├── POST /api/verify/create
    │   ├── GET  /api/verify/:hash
    │   └── GET  /api/verify/record/:id
    │
    ├── SMS API
    │   ├── POST /api/verify/sms
    │   ├── GET  /api/verify/sms/:id/status
    │   └── POST /api/verify/sms/:id/reminder
    │
    ├── Image API
    │   ├── POST /api/image/analyze
    │   ├── POST /api/image/process
    │   └── GET  /api/image/record/:id
    │
    ├── Worker API
    │   ├── GET  /api/workers/:id
    │   ├── GET  /api/workers/:id/trust
    │   └── GET  /api/workers/:id/fintech-handoff
    │
    ├── Webhook API
    │   ├── POST /api/webhook/sms
    │   └── POST /api/webhook/sms/delivery
    │
    └── QR API
        └── GET  /api/qr/:hash
```

---

## 🔄 Trust Calculation Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│                 TRUST SCORE CALCULATION                     │
└─────────────────────────────────────────────────────────────┘

Input Metrics:
• verificationRatio = verifiedRecords / totalRecords
• smsConfirmationRatio = confirmed / sent
• photoValidityAvg = average(validity scores)
• totalRecords = count

Formula:
─────────
score = 0

+ (verificationRatio × 40)      // 40 points max
+ (smsConfirmationRatio × 30)   // 30 points max
+ (photoValidityAvg × 20)       // 20 points max
+ min(10, log10(totalRecords + 1) × 3)  // 10 points max (volume)

= Total Score (0-100)

Trust Tier Mapping:
───────────────────
if score >= 76  → GOLD   (🥇)
if score >= 41  → SILVER (🥈)
if score >= 20  → BRONZE (🥉)
else            → NONE   (⚪)

Credit Readiness Components (for Person 4):
────────────────────────────────────────────
volumeScore       = min(30, (totalRecords / 50) × 30)      [30%]
verificationScore = smsConfirmationRatio × 35              [35%]
validityScore     = photoValidityAvg × 20                  [20%]
repeatClientScore = min(15, (uniqueClients / 10) × 15)    [15%]
                                                    Total: [100%]
```

---

## 🖼️ Image Forensics Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 PHOTO ANALYSIS FLOW                         │
└─────────────────────────────────────────────────────────────┘

Input: Image Buffer
    │
    ├─> EXIF Extraction
    │   ├── Camera: Make, Model
    │   ├── Date: Capture timestamp
    │   ├── GPS: Lat, Long, Altitude
    │   └── Dimensions: Width, Height
    │
    ├─> Perceptual Hash (pHash)
    │   ├── Generate 64-char hash
    │   ├── Compare with existing photos
    │   ├── Calculate Hamming distance
    │   └── Flag if distance < 10
    │
    ├─> Fraud Detection
    │   ├── No EXIF? → Flag
    │   ├── Duplicate? → Flag
    │   ├── Invalid GPS? → Flag
    │   ├── Low res (< 400px)? → Flag
    │   └── Future date? → Flag
    │
    ├─> Validity Scoring
    │   ├── Start: 0.5
    │   ├── +0.2 if EXIF exists
    │   ├── +0.1 if GPS valid
    │   ├── -0.3 if duplicate
    │   ├── -0.1 if low resolution
    │   └── Clamp to [0.0, 1.0]
    │
    └─> Output
        ├── Compressed image
        ├── Thumbnail
        ├── Metadata
        ├── pHash
        └── Validity score
```

---

## 📊 Scalability Considerations

```
Current (MVP):
• Single server
• PostgreSQL on same machine
• Synchronous processing
• No caching

Production Recommendations:
• Load balancer (multiple server instances)
• Separate database server
• Redis caching layer
• Message queue (RabbitMQ/SQS) for async tasks
• CDN for images and QR codes
• Database read replicas
• Connection pooling
• Horizontal scaling
```

---

## 🔌 External Integrations

```
Africa's Talking SMS API
├── Outbound: Send verification SMS
├── Inbound: Receive client responses (webhook)
├── Delivery Reports: Track SMS delivery
└── Rate Limits: 100 SMS/day (sandbox)

Person 1 (Ingestion) Integration
├── Receives: Worker data, audio URL, skills, photos
└── Returns: Verification record, hash, QR code

Person 3 (Frontend) Integration
└── Provides: Complete verification data for UI

Person 4 (FinTech) Integration
└── Provides: Trust metrics for credit scoring
```

---

This architecture supports **500M+ Africans** by making informal skills **visible, verified, and bankable**.
