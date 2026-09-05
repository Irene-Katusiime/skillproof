# Skillproof Verification System - Quick Start Guide

**Person 2: Verification & Cryptographic Vault Engineer**

---

## 🚀 Quick Start (5 Minutes)

### Option A: Automated Setup (Recommended)

**Windows PowerShell:**
```powershell
.\setup.ps1
```

**Git Bash / Linux / Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up PostgreSQL

```bash
# Start PostgreSQL (or use Docker)
docker run --name skillproof-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Or on Windows with installed PostgreSQL:
# Make sure PostgreSQL service is running
```

#### 3. Configure Environment

```bash
# .env file is already created with defaults
# Update DATABASE_URL if using different credentials

# For SMS features, add Africa's Talking API key:
AT_API_KEY="your_sandbox_api_key"
```

#### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed database with test data
npx ts-node prisma/seed.ts
```

#### 5. Start Server

```bash
npm run dev
```

**Server running at:** http://localhost:3000

---

## 🧪 Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Create Verification Record

```bash
curl -X POST http://localhost:3000/api/verify/create \
  -H "Content-Type: application/json" \
  -d '{
    "workerPhone": "+256700000001",
    "audioUrl": "https://example.com/audio/story1.mp3",
    "extractedSkills": [
      {
        "skillName": "Basket Weaving",
        "category": "Handicrafts",
        "level": "advanced",
        "yearsExperience": 5
      }
    ],
    "clientPhone": "+256700000100"
  }'
```

### Verify Hash (QR Code)

```bash
# Use the hash from previous response
curl http://localhost:3000/api/verify/{hash}
```

### Get Worker Trust Metrics

```bash
curl http://localhost:3000/api/workers/{workerId}/trust
```

---

## 📊 View Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

---

## 🔄 Complete Flow Example

### 1. Person 1 → Person 2: Create Verification

**Input from P1:**
```json
{
  "workerPhone": "+256700000001",
  "audioUrl": "https://p1-audio-bucket.com/audio123.mp3",
  "extractedSkills": [
    {
      "skillName": "Motorcycle Repair",
      "category": "Automotive",
      "level": "expert",
      "yearsExperience": 8
    }
  ],
  "clientPhone": "+256700000200"
}
```

**Output to P1:**
```json
{
  "recordId": "uuid",
  "sha256Hash": "abc123...",
  "verificationStatus": "pending",
  "qrCodeData": "data:image/png;base64,...",
  "verificationUrl": "http://localhost:3000/api/verify/abc123..."
}
```

### 2. Trigger SMS Verification

```bash
curl -X POST http://localhost:3000/api/verify/sms \
  -H "Content-Type: application/json" \
  -d '{
    "recordId": "uuid",
    "clientPhone": "+256700000200",
    "workerName": "David Okello",
    "skillSummary": "motorcycle repair"
  }'
```

### 3. Client Responds (via Webhook)

Africa's Talking sends webhook when client replies "YES":

```
POST /api/webhook/sms
from=+256700000200
&text=YES
&date=2026-09-05+10:15:00
```

**System automatically:**
- Updates verification status to "verified"
- Recalculates trust metrics
- Creates client confirmation record

### 4. Person 2 → Person 3: Frontend Handoff

```bash
curl http://localhost:3000/api/verify/record/{recordId}
```

**P3 receives:**
```json
{
  "recordId": "uuid",
  "sha256Hash": "abc123...",
  "verificationStatus": "verified",
  "trustTier": "silver",
  "qrcodeUrl": "http://...",
  "qrcodeData": "data:image/png;base64,...",
  "worker": {
    "id": "uuid",
    "phone": "+256700000001",
    "name": "David Okello"
  },
  "skills": [...],
  "evidence": {
    "audioUrl": "https://...",
    "photos": []
  },
  "verifications": {
    "smsVerified": true,
    "clientConfirmed": true,
    "photosValidated": false
  },
  "timestamp": "2026-09-05T12:00:00Z"
}
```

### 5. Person 2 → Person 4: FinTech Handoff

```bash
curl http://localhost:3000/api/workers/{workerId}/fintech-handoff
```

**P4 receives:**
```json
{
  "workerId": "uuid",
  "workerPhone": "+256700000001",
  "verificationMetrics": {
    "totalRecords": 1,
    "verifiedRecords": 1,
    "verificationRatio": 1.0,
    "smsConfirmations": 1,
    "photoValidityScore": 0.0,
    "trustTier": "silver",
    "creditReadinessContribution": {
      "volumeScore": 10.0,
      "verificationScore": 35.0,
      "validityScore": 0.0
    }
  },
  "trustTier": "silver",
  "recentRecords": [...]
}
```

---

## 🖼️ Photo Processing Flow

### 1. Process Photo Evidence

```bash
curl -X POST http://localhost:3000/api/image/process \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://example.com/photo.jpg",
    "recordId": "uuid"
  }'
```

**System automatically:**
- Downloads image
- Extracts EXIF metadata (camera, GPS, date)
- Generates perceptual hash
- Checks for duplicates
- Calculates validity score
- Detects fraud flags
- Compresses and creates thumbnail
- Updates database

### 2. Check Results

```bash
curl http://localhost:3000/api/image/record/{recordId}
```

---

## 🔐 Trust Tier Calculation

Trust tiers are automatically calculated based on:

- **Verification Ratio** (40%): Verified records / Total records
- **SMS Confirmation** (30%): SMS confirmations / Total verifications
- **Photo Validity** (20%): Average photo validity score
- **Volume Bonus** (10%): Logarithmic bonus for record count

**Tiers:**
- **Gold**: 76-100 points
- **Silver**: 41-75 points
- **Bronze**: 20-40 points
- **None**: 0-19 points

---

## 🧩 Integration with Other Components

### From Person 1 (Ingestion)

**Endpoint:** `POST /api/verify/create`

**Input:** Worker phone, audio URL, extracted skills, client phone, photos

**Output:** Record ID, SHA-256 hash, QR code, verification URL

### To Person 3 (Frontend)

**Endpoint:** `GET /api/verify/record/:recordId`

**Output:** Complete verification data for Skill Passport rendering

### To Person 4 (FinTech/Jobs)

**Endpoint:** `GET /api/workers/:workerId/fintech-handoff`

**Output:** Verification metrics for credit scoring (0-800) and job matching

---

## 📱 SMS Verification Setup

See [AFRICAS_TALKING_SETUP.md](AFRICAS_TALKING_SETUP.md) for detailed instructions.

**Quick Setup:**
1. Create Africa's Talking account (sandbox is free)
2. Get API key from dashboard
3. Add to `.env`: `AT_API_KEY="your_api_key"`
4. Set up webhooks (use ngrok for local dev)
5. Test with sandbox phone numbers

---

## 🗄️ Database Management

### View Data
```bash
npm run prisma:studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Backup Database
```bash
pg_dump -U postgres skillproof > backup.sql
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
Get-Service postgresql*

# Test connection
psql -U postgres -d skillproof -c "SELECT 1"

# Verify DATABASE_URL in .env
```

### SMS Not Sending

```bash
# Check Africa's Talking credentials
# Verify AT_API_KEY is set in .env
# Check sandbox limits (100 SMS/day)
# Review Africa's Talking dashboard logs
```

### Image Processing Fails

```bash
# Ensure Sharp library is installed correctly
npm rebuild sharp

# Check image URL is accessible
# Verify image format (JPEG, PNG, WebP only)
```

---

## 📚 Next Steps

1. **Read Full Documentation:**
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
   - [DATABASE_SETUP.md](DATABASE_SETUP.md)
   - [AFRICAS_TALKING_SETUP.md](AFRICAS_TALKING_SETUP.md)

2. **Run Tests:**
   ```bash
   npm test
   ```

3. **Deploy to Production:**
   - Set up production database
   - Configure production webhooks
   - Enable authentication
   - Set up monitoring

4. **Integrate with Team:**
   - Coordinate with P1 for data handoff
   - Provide endpoints to P3 for frontend
   - Share metrics with P4 for credit scoring

---

## 🎯 Key Deliverables Checklist

- [x] SHA-256 ledger stamping engine
- [x] SMS verification system
- [x] Vision & Forensic AI pipeline
- [x] Database schema and migrations
- [x] API routes and controllers
- [x] QR code generation
- [x] Trust tier calculation
- [x] Credit readiness scoring
- [x] Handoff interfaces for P3 & P4
- [x] Comprehensive documentation

---

## 💡 Tips

- Use Prisma Studio to visualize database changes
- Check server logs for detailed error messages
- Test webhooks with ngrok before production
- Monitor trust metrics after each verification
- Backup database before migrations

---

**Happy Building! 🚀**
