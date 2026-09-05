// Core Type Definitions for SkillProof

// ==================== BACKEND VERIFICATION TYPES ====================

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
  phone: string
  name?: string
  email?: string
}

export interface SkillRecordInput {
  workerPhone: string
  audioUrl: string
  extractedSkills: ExtractedSkill[]
  clientPhone?: string
  photos?: string[]
  metadata?: Record<string, any>
}

export interface ExtractedSkill {
  skillName: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsExperience?: number
  description?: string
}

export interface VerificationRecord {
  recordId: string
  sha256Hash: string
  verificationStatus: VerificationStatus
  trustTier: TrustTier
  qrcodeUrl: string
  timestamp: Date
  workerId: string
  workerPhone: string
}

export interface VerificationMetrics {
  workerId: string
  totalRecords: number
  verifiedRecords: number
  verificationRatio: number
  smsConfirmations: number
  photoValidityScore: number
  trustTier: TrustTier
  creditReadinessContribution: {
    volumeScore: number
    verificationScore: number
    validityScore: number
  }
}

export interface SMSVerificationRequest {
  recordId: string
  clientPhone: string
  workerName: string
  skillSummary: string
}

export interface SMSVerificationResponse {
  success: boolean
  messageId?: string
  status: string
  timestamp: Date
}

export interface ImageAnalysisResult {
  hasEXIF: boolean
  metadata?: {
    make?: string
    model?: string
    dateTime?: string
    gps?: {
      latitude: number
      longitude: number
      altitude?: number
    }
    dimensions: {
      width: number
      height: number
    }
  }
  pHash: string
  isDuplicate: boolean
  duplicateOf?: string
  validityScore: number
  fraudFlags: string[]
}

export interface HashInput {
  audioUrl: string
  audioBuffer?: Buffer
  photos?: string[]
  metadata: {
    workerPhone: string
    clientPhone?: string
    skills: ExtractedSkill[]
    timestamp: string
  }
}

export interface QRCodeData {
  hash: string
  recordId: string
  workerPhone: string
  verificationUrl: string
}

export interface FrontendHandoff {
  recordId: string
  sha256Hash: string
  verificationStatus: VerificationStatus
  trustTier: TrustTier
  qrcodeUrl: string
  qrcodeData: string
  verificationUrl: string
  worker: {
    id: string
    phone: string
    name?: string
  }
  skills: ExtractedSkill[]
  evidence: {
    audioUrl: string
    photos: string[]
  }
  verifications: {
    smsVerified: boolean
    clientConfirmed: boolean
    photosValidated: boolean
  }
  timestamp: Date
}

export interface FinTechHandoff {
  workerId: string
  workerPhone: string
  creditScore?: number
  verificationMetrics: VerificationMetrics
  trustTier: TrustTier
  recentRecords: {
    recordId: string
    skills: string[]
    verified: boolean
    timestamp: Date
  }[]
}

// ==================== FRONTEND TYPES ====================

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface Skill {
  id: string
  name: string
  category: string
  level: SkillLevel
  yearsOfExperience: number
  verified: boolean
  endorsements: number
}

export interface Project {
  id: string
  title: string
  description: string
  audioDescription?: string
  videoDescription?: string
  clientName: string
  clientContact?: string
  completedAt: string
  category: string
  images?: string[]
  confirmed: boolean
  testimonial?: string
  rating?: number
}

export interface Assessment {
  id: string
  skillName: string
  score: number
  maxScore: number
  takenAt: string
  passed: boolean
}

export interface Endorsement {
  id: string
  clientName: string
  clientRole: string
  message: string
  rating: number
  date: string
  verified: boolean
  projectId?: string
}

export interface WorkerProfile {
  id: string
  name: string
  tagline: string
  location: string
  phone: string
  email: string
  avatar?: string
  profession: string
  yearsActive: number
  bio: string
  skills: Skill[]
  projects: Project[]
  assessments: Assessment[]
  endorsements: Endorsement[]
  passportId: string
  passportIssuedAt: string
  totalEarnings?: string
  completedJobs: number
  rating: number
  onboardingComplete: boolean
}
