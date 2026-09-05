// Core Type Definitions for Skillproof Verification System

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum TrustTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  NONE = 'none'
}

export interface WorkerInput {
  phone: string;
  name?: string;
  email?: string;
}

export interface SkillRecordInput {
  workerPhone: string;
  audioUrl: string;
  extractedSkills: ExtractedSkill[];
  clientPhone?: string;
  photos?: string[];
  metadata?: Record<string, any>;
}

export interface ExtractedSkill {
  skillName: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  description?: string;
}

export interface VerificationRecord {
  recordId: string;
  sha256Hash: string;
  verificationStatus: VerificationStatus;
  trustTier: TrustTier;
  qrcodeUrl: string;
  timestamp: Date;
  workerId: string;
  workerPhone: string;
}

export interface VerificationMetrics {
  workerId: string;
  totalRecords: number;
  verifiedRecords: number;
  verificationRatio: number;
  smsConfirmations: number;
  photoValidityScore: number;
  trustTier: TrustTier;
  creditReadinessContribution: {
    volumeScore: number;
    verificationScore: number;
    validityScore: number;
  };
}

export interface SMSVerificationRequest {
  recordId: string;
  clientPhone: string;
  workerName: string;
  skillSummary: string;
}

export interface SMSVerificationResponse {
  success: boolean;
  messageId?: string;
  status: string;
  timestamp: Date;
}

export interface ImageAnalysisResult {
  hasEXIF: boolean;
  metadata?: {
    make?: string;
    model?: string;
    dateTime?: string;
    gps?: {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    dimensions: {
      width: number;
      height: number;
    };
  };
  pHash: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  validityScore: number;
  fraudFlags: string[];
}

export interface HashInput {
  audioUrl: string;
  audioBuffer?: Buffer;
  photos?: string[];
  metadata: {
    workerPhone: string;
    clientPhone?: string;
    skills: ExtractedSkill[];
    timestamp: string;
  };
}

export interface QRCodeData {
  hash: string;
  recordId: string;
  workerPhone: string;
  verificationUrl: string;
}

// Handoff to Person 3 (Frontend)
export interface FrontendHandoff {
  recordId: string;
  sha256Hash: string;
  verificationStatus: VerificationStatus;
  trustTier: TrustTier;
  qrcodeUrl: string;
  qrcodeData: string; // Base64 QR code image
  verificationUrl: string;
  worker: {
    id: string;
    phone: string;
    name?: string;
  };
  skills: ExtractedSkill[];
  evidence: {
    audioUrl: string;
    photos: string[];
  };
  verifications: {
    smsVerified: boolean;
    clientConfirmed: boolean;
    photosValidated: boolean;
  };
  timestamp: Date;
}

// Handoff to Person 4 (FinTech/Jobs)
export interface FinTechHandoff {
  workerId: string;
  workerPhone: string;
  creditScore?: number; // Will be calculated by P4 using our metrics
  verificationMetrics: VerificationMetrics;
  trustTier: TrustTier;
  recentRecords: {
    recordId: string;
    skills: string[];
    verified: boolean;
    timestamp: Date;
  }[];
}
