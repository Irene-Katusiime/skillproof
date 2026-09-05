export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
export type VerificationStatus = 'pending' | 'verified' | 'unverified'

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
  audioDescription?: string   // base64 data URL of recorded audio
  videoDescription?: string   // base64 data URL of uploaded/recorded video
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
