import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { WorkerProfile, Skill, Project, Endorsement } from '../types'
import { workerProfile as seedProfile } from '../data/mockData'

// ─── Simple hash (demo only — not cryptographic) ──────────────────────────────
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return hash.toString(16)
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Credential { workerId: string; email: string; passwordHash: string }

export type LoginError = 'invalid_credentials' | 'email_not_found' | null

export interface RegisterData {
  name: string; profession: string; tagline: string
  location: string; phone: string; email: string; bio: string
}

interface AppContextType {
  currentUserId: string | null
  isLoggedIn: boolean
  allWorkers: WorkerProfile[]
  loginWithPassword: (email: string, password: string) => LoginError
  logout: () => void
  register: (data: RegisterData, password: string) => WorkerProfile
  emailExists: (email: string) => boolean
  profile: WorkerProfile
  addSkill: (skill: Omit<Skill, 'id' | 'verified' | 'endorsements'>) => void
  addProject: (project: Omit<Project, 'id' | 'confirmed'>) => void
  addEndorsement: (endorsement: Omit<Endorsement, 'id' | 'verified'>) => void
  confirmProject: (projectId: string, testimonial: string, rating: number) => void
  completeOnboarding: () => void
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  workers:     'sp_workers_v2',   // v2 = includes onboardingComplete
  credentials: 'sp_creds_v2',
  currentUser: 'sp_current_user',
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_WORKERS: WorkerProfile[] = [{ ...seedProfile, onboardingComplete: true }]
const SEED_CREDS:   Credential[]    = [{
  workerId:     seedProfile.id,
  email:        seedProfile.email,
  passwordHash: simpleHash('demo1234'),
}]

// ─── Loaders ─────────────────────────────────────────────────────────────────
function loadWorkers(): WorkerProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.workers)
    if (raw) {
      const list = JSON.parse(raw) as WorkerProfile[]
      // Always ensure the seed worker is present with onboardingComplete
      const hasSeed = list.some(w => w.id === seedProfile.id)
      const patched = list.map(w => ({ ...w, onboardingComplete: w.onboardingComplete ?? true }))
      if (!hasSeed) patched.unshift({ ...seedProfile, onboardingComplete: true })
      return patched
    }
  } catch { /* ignore */ }
  return SEED_WORKERS
}

function loadCredentials(): Credential[] {
  try {
    const raw = localStorage.getItem(KEYS.credentials)
    if (raw) {
      const list = JSON.parse(raw) as Credential[]
      // Always ensure the seed credential is present
      const hasSeed = list.some(c => c.email.toLowerCase() === seedProfile.email.toLowerCase())
      if (!hasSeed) return [...SEED_CREDS, ...list]
      return list
    }
  } catch { /* ignore */ }
  return SEED_CREDS
}

function loadCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.currentUser)
}

// ─── Empty profile (used when no user logged in) ──────────────────────────────
const EMPTY: WorkerProfile = {
  id: '', passportId: '', passportIssuedAt: '',
  name: '', tagline: '', profession: '',
  location: '', phone: '', email: '',
  yearsActive: 0, bio: '', completedJobs: 0, rating: 0,
  onboardingComplete: false,
  skills: [], projects: [], assessments: [], endorsements: [],
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [workers,       setWorkers]       = useState<WorkerProfile[]>(() => loadWorkers())
  const [credentials,   setCredentials]   = useState<Credential[]>(() => loadCredentials())
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadCurrentUserId())

  // Persist to the NEW v2 keys every time state changes
  useEffect(() => { localStorage.setItem(KEYS.workers,     JSON.stringify(workers))     }, [workers])
  useEffect(() => { localStorage.setItem(KEYS.credentials, JSON.stringify(credentials)) }, [credentials])

  const activeProfile = workers.find(w => w.id === currentUserId) ?? EMPTY

  // ── Auth ──────────────────────────────────────────────────────────────────
  const emailExists = (email: string) =>
    credentials.some(c => c.email.toLowerCase() === email.toLowerCase())

  const loginWithPassword = (email: string, password: string): LoginError => {
    const cred = credentials.find(c => c.email.toLowerCase() === email.toLowerCase())
    if (!cred) return 'email_not_found'
    if (cred.passwordHash !== simpleHash(password)) return 'invalid_credentials'
    localStorage.setItem(KEYS.currentUser, cred.workerId)
    setCurrentUserId(cred.workerId)
    return null
  }

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser)
    setCurrentUserId(null)
  }

  const register = (data: RegisterData, password: string): WorkerProfile => {
    const id = `worker-${Date.now()}`
    const passportId = `SP-${new Date().getFullYear()}-${data.location.slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`
    const newWorker: WorkerProfile = {
      ...EMPTY, id, passportId,
      passportIssuedAt: new Date().toISOString().split('T')[0],
      name: data.name, tagline: data.tagline || data.profession,
      profession: data.profession, location: data.location,
      phone: data.phone, email: data.email, bio: data.bio,
      onboardingComplete: false,
    }
    const newCred: Credential = { workerId: id, email: data.email, passwordHash: simpleHash(password) }
    setWorkers(prev => [...prev, newWorker])
    setCredentials(prev => [...prev, newCred])
    localStorage.setItem(KEYS.currentUser, id)
    setCurrentUserId(id)
    return newWorker
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateActive = (fn: (p: WorkerProfile) => WorkerProfile) =>
    setWorkers(prev => prev.map(w => w.id === currentUserId ? fn(w) : w))

  const addSkill = (skill: Omit<Skill, 'id' | 'verified' | 'endorsements'>) =>
    updateActive(p => ({ ...p, skills: [...p.skills, { ...skill, id: `s${Date.now()}`, verified: false, endorsements: 0 }] }))

  const addProject = (project: Omit<Project, 'id' | 'confirmed'>) =>
    updateActive(p => ({ ...p, projects: [{ ...project, id: `p${Date.now()}`, confirmed: false }, ...p.projects], completedJobs: p.completedJobs + 1 }))

  const addEndorsement = (endorsement: Omit<Endorsement, 'id' | 'verified'>) =>
    updateActive(p => ({ ...p, endorsements: [{ ...endorsement, id: `e${Date.now()}`, verified: false }, ...p.endorsements] }))

  const confirmProject = (projectId: string, testimonial: string, rating: number) =>
    updateActive(p => ({ ...p, projects: p.projects.map(proj => proj.id === projectId ? { ...proj, confirmed: true, testimonial, rating } : proj) }))

  const completeOnboarding = () =>
    updateActive(p => ({ ...p, onboardingComplete: true }))

  return (
    <AppContext.Provider value={{
      currentUserId, isLoggedIn: !!currentUserId,
      allWorkers: workers,
      loginWithPassword, logout, register, emailExists,
      profile: activeProfile,
      addSkill, addProject, addEndorsement, confirmProject, completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
