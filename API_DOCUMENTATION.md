# Skillproof Verification API Documentation

**Version:** 1.0.0  
**Person 2:** Verification & Cryptographic Vault Engineer

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Verification Endpoints](#verification-endpoints)
5. [SMS Verification Endpoints](#sms-verification-endpoints)
6. [Image Processing Endpoints](#image-processing-endpoints)
7. [Worker Endpoints](#worker-endpoints)
8. [Webhook Endpoints](#webhook-endpoints)
9. [QR Code Endpoints](#qr-code-endpoints)
10. [Handoff Interfaces](#handoff-interfaces)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)

---

## Overview

The Skillproof Verification API provides cryptographic verification, SMS triangulation, and image forensics for skill passport validation.

### Core Features
- ✅ SHA-256 immutable ledger
- ✅ SMS customer verification
- ✅ EXIF metadata extraction
- ✅ Duplicate photo detection
- ✅ Trust tier calculation
- ✅ Credit readiness scoring

---

## Authentication

Currently, the API is open for MVP. Production deployment should implement JWT authentication.

**Planned Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Base URL

**Development:** `http://localhost:3000`  
**Production:** `https://api.skillproof.com` (TBD)

---

## Verification Endpoints

### 1. Create Verification Record

Create a new verification record with SHA-256 hash and QR code.

**Endpoint:** `POST /api/verify/create`

**Request Body:**
```json
{
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
  "clientPhone": "+256700000100",
  "photos": [
    "https://example.com/photos/basket1.jpg"
  ],
  "metadata": {}
}
```

**Response (201):**
```json
{
  "success": true,
  "recordId": "uuid",
  "sha256Hash": "abc123...",
  "verificationStatus": "pending",
  "qrCodeData": "data:image/png;base64,...",
  "verificationUrl": "http://localhost:3000/api/verify/abc123...",
  "message": "Verification record created successfully"
}
```

---

### 2. Verify Hash (QR Code Resolution)

Verify a SHA-256 hash and get complete record details.

**Endpoint:** `GET /api/verify/:hash`

**Example:** `GET /api/verify/abc123...`

**Response (200):**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "recordId": "uuid",
    "sha256Hash": "abc123...",
    "verificationStatus": "verified",
    "trustTier": "silver",
    "qrcodeUrl": "http://localhost:3000/api/qr/abc123...",
    "qrcodeData": "data:image/png;base64,...",
    "verificationUrl": "http://localhost:3000/api/verify/abc123...",
    "worker": {
      "id": "uuid",
      "phone": "+256700000001",
      "name": "Amina Nakato"
    },
    "skills": [...],
    "evidence": {
      "audioUrl": "https://...",
      "photos": ["https://..."]
    },
    "verifications": {
      "smsVerified": true,
      "clientConfirmed": true,
      "photosValidated": true
    },
    "timestamp": "2026-09-05T12:00:00Z"
  },
  "accessCount": 5
}
```

---

### 3. Get Verification by Record ID

**Endpoint:** `GET /api/verify/record/:recordId`

**Response:** Same as verify hash endpoint

---

## SMS Verification Endpoints

### 1. Send Verification SMS

Send verification SMS to client for customer triangulation.

**Endpoint:** `POST /api/verify/sms`

**Request Body:**
```json
{
  "recordId": "uuid",
  "clientPhone": "+256700000100",
  "workerName": "Amina Nakato",
  "skillSummary": "basket weaving"
}
```

**Response (200):**
```json
{
  "success": true,
  "messageId": "ATSms_123",
  "status": "sent",
  "message": "Verification SMS sent successfully"
}
```

---

### 2. Get Verification Status

**Endpoint:** `GET /api/verify/sms/:recordId/status`

**Response (200):**
```json
{
  "success": true,
  "recordId": "uuid",
  "status": {
    "sent": true,
    "confirmed": false,
    "pending": true,
    "failed": false
  }
}
```

---

### 3. Send Reminder

**Endpoint:** `POST /api/verify/sms/:verificationId/reminder`

**Response (200):**
```json
{
  "success": true,
  "message": "Reminder sent successfully"
}
```

---

### 4. Bulk Send Verifications

**Endpoint:** `POST /api/verify/sms/bulk`

**Request Body:**
```json
{
  "requests": [
    {
      "recordId": "uuid1",
      "clientPhone": "+256700000100",
      "workerName": "Worker 1",
      "skillSummary": "skill 1"
    },
    {
      "recordId": "uuid2",
      "clientPhone": "+256700000200",
      "workerName": "Worker 2",
      "skillSummary": "skill 2"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2,
  "results": [...]
}
```

---

### 5. Get Verification History

**Endpoint:** `GET /api/verify/sms/:recordId/history`

**Response (200):**
```json
{
  "success": true,
  "recordId": "uuid",
  "count": 2,
  "verifications": [
    {
      "id": "uuid",
      "clientPhone": "+256700000100",
      "status": "confirmed",
      "sentAt": "2026-09-05T10:00:00Z",
      "deliveredAt": "2026-09-05T10:00:05Z",
      "respondedAt": "2026-09-05T10:15:00Z",
      "clientResponse": "YES"
    }
  ]
}
```

---

## Image Processing Endpoints

### 1. Analyze Image

Upload and analyze image for EXIF, GPS, and fraud detection.

**Endpoint:** `POST /api/image/analyze`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: Image file (JPEG, PNG, WebP)
- `recordId`: UUID of skill record

**Response (200):**
```json
{
  "success": true,
  "analysis": {
    "hasEXIF": true,
    "metadata": {
      "make": "Samsung",
      "model": "Galaxy A12",
      "dateTime": "2026-09-01T14:30:00Z",
      "gps": {
        "latitude": 0.3136,
        "longitude": 32.5811,
        "altitude": 1200
      },
      "dimensions": {
        "width": 1920,
        "height": 1080
      }
    },
    "pHash": "abc123def456",
    "isDuplicate": false,
    "validityScore": 0.95,
    "fraudFlags": []
  },
  "message": "Image analyzed successfully"
}
```

---

### 2. Compress Image

**Endpoint:** `POST /api/image/compress`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: Image file
- `quality`: 1-100 (optional, default: 80)

**Response (200):**
```json
{
  "success": true,
  "originalSize": 5242880,
  "compressedSize": 1048576,
  "thumbnailSize": 102400,
  "compressionRatio": "80.00%",
  "message": "Image compressed successfully"
}
```

---

### 3. Process Photo Evidence

**Endpoint:** `POST /api/image/process`

**Request Body:**
```json
{
  "photoUrl": "https://example.com/photo.jpg",
  "recordId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Photo evidence processed successfully"
}
```

---

### 4. Batch Process Photos

**Endpoint:** `POST /api/image/batch-process`

**Request Body:**
```json
{
  "photoUrls": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "recordId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "processed": 2,
  "failed": 0,
  "total": 2,
  "message": "Processed 2 of 2 photos"
}
```

---

### 5. Get Photo Evidence

**Endpoint:** `GET /api/image/record/:recordId`

**Response (200):**
```json
{
  "success": true,
  "recordId": "uuid",
  "count": 1,
  "photos": [
    {
      "id": "uuid",
      "photoUrl": "https://...",
      "thumbnailUrl": "https://...",
      "compressedUrl": "https://...",
      "hasEXIF": true,
      "cameraMake": "Samsung",
      "cameraModel": "Galaxy A12",
      "capturedAt": "2026-09-01T14:30:00Z",
      "location": {
        "latitude": 0.3136,
        "longitude": 32.5811,
        "altitude": 1200
      },
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "isDuplicate": false,
      "validityScore": 0.95,
      "fraudFlags": [],
      "uploadedAt": "2026-09-05T12:00:00Z",
      "analyzedAt": "2026-09-05T12:01:00Z"
    }
  ]
}
```

---

### 6. Check Duplicate

**Endpoint:** `POST /api/image/check-duplicate`

**Content-Type:** `multipart/form-data`

**Response (200):**
```json
{
  "success": true,
  "isDuplicate": false,
  "pHash": "abc123def456",
  "message": "No duplicate found"
}
```

---

### 7. Get Fraud Statistics

**Endpoint:** `GET /api/image/fraud-stats/:workerId`

**Response (200):**
```json
{
  "success": true,
  "workerId": "uuid",
  "stats": {
    "totalPhotos": 10,
    "photosWithEXIF": 8,
    "exifRatio": "0.80",
    "duplicatePhotos": 1,
    "duplicateRatio": "0.10",
    "photosWithGPS": 7,
    "gpsRatio": "0.70",
    "avgValidityScore": "0.88",
    "fraudFlagCounts": {
      "no_exif_data": 2,
      "duplicate_photo": 1
    },
    "totalFraudFlags": 3
  }
}
```

---

## Worker Endpoints

### 1. Get Worker Profile

**Endpoint:** `GET /api/workers/:workerId`

**Response (200):**
```json
{
  "success": true,
  "worker": {
    "id": "uuid",
    "phone": "+256700000001",
    "name": "Amina Nakato",
    "email": "amina@example.com",
    "createdAt": "2026-09-01T00:00:00Z",
    "trustMetrics": {...},
    "recentRecords": [...]
  }
}
```

---

### 2. Get Worker by Phone

**Endpoint:** `GET /api/workers/phone/:phone`

**Example:** `GET /api/workers/phone/+256700000001`

---

### 3. Get Worker Records

**Endpoint:** `GET /api/workers/:workerId/records?limit=20&offset=0`

**Response (200):**
```json
{
  "success": true,
  "workerId": "uuid",
  "total": 45,
  "limit": 20,
  "offset": 0,
  "records": [...]
}
```

---

### 4. Get Trust Metrics

**Endpoint:** `GET /api/workers/:workerId/trust`

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "workerId": "uuid",
    "totalRecords": 45,
    "verifiedRecords": 42,
    "verificationRatio": 0.93,
    "smsConfirmations": 38,
    "photoValidityScore": 0.88,
    "trustTier": "silver",
    "creditReadinessContribution": {
      "volumeScore": 25.0,
      "verificationScore": 32.5,
      "validityScore": 17.6
    }
  }
}
```

---

### 5. Get FinTech Handoff (For Person 4)

**Endpoint:** `GET /api/workers/:workerId/fintech-handoff`

**Response (200):**
```json
{
  "success": true,
  "handoff": {
    "workerId": "uuid",
    "workerPhone": "+256700000001",
    "verificationMetrics": {...},
    "trustTier": "silver",
    "recentRecords": [
      {
        "recordId": "uuid",
        "skills": ["Basket Weaving", "Quality Control"],
        "verified": true,
        "timestamp": "2026-09-05T12:00:00Z"
      }
    ]
  }
}
```

---

### 6. Create/Update Worker

**Endpoint:** `POST /api/workers`

**Request Body:**
```json
{
  "phone": "+256700000001",
  "name": "Amina Nakato",
  "email": "amina@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "worker": {...}
}
```

---

## Webhook Endpoints

### 1. SMS Webhook (Africa's Talking)

**Endpoint:** `POST /api/webhook/sms`

**Content-Type:** `application/x-www-form-urlencoded`

**Body:**
```
from=+256700000100
&to=shortcode
&text=YES
&date=2026-09-05+12:00:00
&id=message-id
&linkId=verification-code
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

### 2. SMS Delivery Report

**Endpoint:** `POST /api/webhook/sms/delivery`

**Body:**
```
id=message-id
&status=Success
&phoneNumber=+256700000100
&retryCount=0
```

---

## QR Code Endpoints

### Get QR Code Image

**Endpoint:** `GET /api/qr/:hash`

**Response:** PNG image (200)

---

## Handoff Interfaces

### To Person 3 (Frontend)

**Endpoint:** `GET /api/verify/record/:recordId`

Returns complete verification data for rendering Skill Passport UI.

### To Person 4 (FinTech/Jobs)

**Endpoint:** `GET /api/workers/:workerId/fintech-handoff`

Returns verification metrics for credit scoring and job matching.

---

## Error Handling

All errors return:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

---

## Rate Limiting

**Current:** No rate limiting (MVP)

**Planned Production Limits:**
- 100 requests/minute per IP
- 1000 requests/hour per API key

---

## Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Create Verification
```bash
curl -X POST http://localhost:3000/api/verify/create \
  -H "Content-Type: application/json" \
  -d '{
    "workerPhone": "+256700000001",
    "audioUrl": "https://example.com/audio.mp3",
    "extractedSkills": [{
      "skillName": "Carpentry",
      "category": "Construction",
      "level": "advanced"
    }],
    "clientPhone": "+256700000100"
  }'
```

### Verify Hash
```bash
curl http://localhost:3000/api/verify/abc123...
```

---

## Support

- **Documentation:** See README.md, DATABASE_SETUP.md, AFRICAS_TALKING_SETUP.md
- **Issues:** Create GitHub issue
- **Email:** support@skillproof.com (TBD)
