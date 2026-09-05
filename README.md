# Skillproof Verification & Cryptographic Vault System

**Person 2: Verification & Cryptographic Vault Engineer**

## 🎯 Role
The Trust Builder - Makes every record tamper-proof and verified.

## 🔐 Core Components

### 1. SHA-256 Ledger Stamping Engine
- Node.js crypto hashing service
- Public QR code resolver API: `GET /api/verify/:hash`
- Tamper-proof proof of work

### 2. SMS Verification System
- Africa's Talking SMS dispatch
- Automated client verification ping-pong
- Webhook response listener

### 3. Vision & Forensic AI Pipeline
- EXIF metadata extraction
- GPS tagging
- pHash duplicate photo detection
- Image compression with sharp

### 4. Database & Data Access Layer
- PostgreSQL schema design
- Prisma ORM migrations
- CRUD routes
- Fraud flag queries

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## 🗄️ Database Setup

Make sure PostgreSQL is running, then update the `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/skillproof?schema=public"
```

## 🚀 API Endpoints

### Verification Endpoints
- `POST /api/verify/create` - Create verification record
- `GET /api/verify/:hash` - Resolve QR code and verify hash
- `GET /api/verify/record/:recordId` - Get verification details
- `POST /api/verify/sms` - Trigger SMS verification
- `POST /api/webhook/sms` - Africa's Talking SMS webhook

### Image Processing
- `POST /api/image/analyze` - Extract EXIF and detect duplicates
- `POST /api/image/compress` - Compress and optimize images

### Records Management
- `GET /api/records/:workerId` - Get all records for a worker
- `POST /api/records` - Create new skill record
- `PUT /api/records/:id` - Update record
- `GET /api/records/:id/trust-tier` - Calculate trust tier

## 🔄 Handoff Data Structures

### To Person 3 (Frontend):
```json
{
  "recordId": "uuid",
  "sha256Hash": "abc123...",
  "verificationStatus": "verified|pending|failed",
  "trustTier": "bronze|silver|gold",
  "qrcodeUrl": "https://..."
}
```

### To Person 4 (FinTech):
```json
{
  "workerId": "uuid",
  "verificationMetrics": {
    "totalRecords": 45,
    "verifiedRecords": 42,
    "verificationRatio": 0.93,
    "smsConfirmations": 38,
    "photoValidityScore": 0.88,
    "trustTier": "silver"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📊 Prisma Studio

View and manage database:

```bash
npm run prisma:studio
```

## 🛠️ Technology Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **SMS:** Africa's Talking API
- **Image Processing:** Sharp, exif-reader, imghash
- **Cryptography:** Node.js crypto (SHA-256)
- **QR Codes:** qrcode library

## 📝 License

MIT
