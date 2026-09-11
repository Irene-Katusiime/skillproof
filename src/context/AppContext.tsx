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
interface Credential {
  workerId: string
  email: string
  passwordHash: string
  role: 'worker' | 'employer'
}

export type LoginError = 'invalid_credentials' | 'email_not_found' | null

export interface RegisterData {
  name: string; profession: string; tagline: string
  location: string; phone: string; email: string; bio: string
}

export interface EmployerRegisterData {
  companyName: string
  industry: string
  location: string
  email: string
  phone: string
  website?: string
}

export interface EmployerProfile {
  id: string
  companyName: string
  industry: string
  location: string
  email: string
  phone: string
  website?: string
  savedWorkerIds: string[]
  hireRequests: HireRequest[]
}

export interface HireRequest {
  id: string
  workerId: string
  workerName: string
  jobTitle: string
  sentAt: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface EndorsementRequest {
  id: string
  token: string
  workerId: string
  projectId?: string
  clientEmail?: string
  clientName?: string
  status: 'pending' | 'completed'
  createdAt: string
}

interface AppContextType {
  // Auth
  currentUserId: string | null
  currentRole: 'worker' | 'employer' | null
  isLoggedIn: boolean
  isWorker: boolean
  isEmployer: boolean
  allWorkers: WorkerProfile[]
  loginWithPassword: (email: string, password: string) => LoginError
  logout: () => void
  register: (data: RegisterData, password: string) => WorkerProfile
  registerEmployer: (data: EmployerRegisterData, password: string) => EmployerProfile
  emailExists: (email: string) => boolean

  // Worker profile
  profile: WorkerProfile
  addSkill: (skill: Omit<Skill, 'id' | 'verified' | 'endorsements'>) => void
  addProject: (project: Omit<Project, 'id' | 'confirmed'>) => void
  addEndorsement: (endorsement: Omit<Endorsement, 'id' | 'verified'>) => void
  confirmProject: (projectId: string, testimonial: string, rating: number) => void
  completeOnboarding: () => void

  // Employer profile
  employerProfile: EmployerProfile | null
  saveWorker: (workerId: string) => void
  unsaveWorker: (workerId: string) => void
  addHireRequest: (req: Omit<HireRequest, 'id' | 'sentAt' | 'status'>) => void
  // Endorsement requests
  createEndorsementRequest: (opts: { projectId?: string; clientEmail?: string; clientName?: string }) => EndorsementRequest
  getEndorsementRequestByToken: (token: string) => EndorsementRequest | undefined
  completeEndorsementRequest: (token: string, endorsement: Omit<Endorsement, 'id' | 'verified' | 'date'>) => boolean
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  workers:     'sp_workers_v2',
  credentials: 'sp_creds_v2',
  employers:   'sp_employers_v1',
  currentUser: 'sp_current_user',
  currentRole: 'sp_current_role',
  endorseReqs: 'sp_endorse_reqs_v1',
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_WORKERS: WorkerProfile[] = [{ ...seedProfile, onboardingComplete: true }]
const SEED_CREDS: Credential[] = [{
  workerId:     seedProfile.id,
  email:        seedProfile.email,
  passwordHash: simpleHash('demo1234'),
  role:         'worker',
}]

// ─── Employer loaders ─────────────────────────────────────────────────────────
function loadEmployers(): EmployerProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.employers)
    if (raw) return JSON.parse(raw) as EmployerProfile[]
  } catch { /* ignore */ }
  return []
}
function saveEmployers(e: EmployerProfile[]) {
  localStorage.setItem(KEYS.employers, JSON.stringify(e))
}

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
      const hasSeed = list.some(c => c.email.toLowerCase() === seedProfile.email.toLowerCase())
      // patch old creds that pre-date role field
      const patched = list.map(c => ({ ...c, role: c.role ?? 'worker' as const }))
      if (!hasSeed) return [...SEED_CREDS, ...patched]
      return patched
    }
  } catch { /* ignore */ }
  return SEED_CREDS
}

function loadCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.currentUser)
}

function loadCurrentRole(): 'worker' | 'employer' | null {
  const r = localStorage.getItem(KEYS.currentRole)
  if (r === 'worker' || r === 'employer') return r
  return null
}

function loadEndorsementRequests(): EndorsementRequest[] {
  try {
    const raw = localStorage.getItem(KEYS.endorseReqs)
    if (raw) return JSON.parse(raw) as EndorsementRequest[]
  } catch {}
  return []
}

function saveEndorsementRequests(list: EndorsementRequest[]) {
  localStorage.setItem(KEYS.endorseReqs, JSON.stringify(list))
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
  const [employers,     setEmployers]     = useState<EmployerProfile[]>(() => loadEmployers())
  const [endorseReqs,   setEndorseReqs]   = useState<EndorsementRequest[]>(() => loadEndorsementRequests())
  const [credentials,   setCredentials]   = useState<Credential[]>(() => loadCredentials())
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadCurrentUserId())
  const [currentRole,   setCurrentRole]   = useState<'worker' | 'employer' | null>(() => loadCurrentRole())

  useEffect(() => { localStorage.setItem(KEYS.workers,     JSON.stringify(workers))     }, [workers])
  useEffect(() => { localStorage.setItem(KEYS.credentials, JSON.stringify(credentials)) }, [credentials])
  useEffect(() => { saveEmployers(employers)                                             }, [employers])
  useEffect(() => { saveEndorsementRequests(endorseReqs)                                }, [endorseReqs])

  const activeProfile  = workers.find(w => w.id === currentUserId) ?? EMPTY
  const employerProfile = employers.find(e => e.id === currentUserId) ?? null

  // ── Auth ──────────────────────────────────────────────────────────────────
  const emailExists = (email: string) =>
    credentials.some(c => c.email.toLowerCase() === email.toLowerCase())

  const loginWithPassword = (email: string, password: string): LoginError => {
    const cred = credentials.find(c => c.email.toLowerCase() === email.toLowerCase())
    if (!cred) return 'email_not_found'
    if (cred.passwordHash !== simpleHash(password)) return 'invalid_credentials'
    localStorage.setItem(KEYS.currentUser, cred.workerId)
    localStorage.setItem(KEYS.currentRole, cred.role)
    setCurrentUserId(cred.workerId)
    setCurrentRole(cred.role)
    return null
  }

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser)
    localStorage.removeItem(KEYS.currentRole)
    setCurrentUserId(null)
    setCurrentRole(null)
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
    const newCred: Credential = { workerId: id, email: data.email, passwordHash: simpleHash(password), role: 'worker' }
    setWorkers(prev => [...prev, newWorker])
    setCredentials(prev => [...prev, newCred])
    localStorage.setItem(KEYS.currentUser, id)
    localStorage.setItem(KEYS.currentRole, 'worker')
    setCurrentUserId(id)
    setCurrentRole('worker')
    return newWorker
  }

  const registerEmployer = (data: EmployerRegisterData, password: string): EmployerProfile => {
    const id = `employer-${Date.now()}`
    const newEmployer: EmployerProfile = {
      id,
      companyName: data.companyName,
      industry:    data.industry,
      location:    data.location,
      email:       data.email,
      phone:       data.phone,
      website:     data.website,
      savedWorkerIds: [],
      hireRequests:   [],
    }
    const newCred: Credential = { workerId: id, email: data.email, passwordHash: simpleHash(password), role: 'employer' }
    setEmployers(prev => [...prev, newEmployer])
    setCredentials(prev => [...prev, newCred])
    localStorage.setItem(KEYS.currentUser, id)
    localStorage.setItem(KEYS.currentRole, 'employer')
    setCurrentUserId(id)
    setCurrentRole('employer')
    return newEmployer
  }

  // ── Worker mutations ──────────────────────────────────────────────────────
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

  // ── Employer mutations ────────────────────────────────────────────────────
  const updateEmployer = (fn: (e: EmployerProfile) => EmployerProfile) =>
    setEmployers(prev => prev.map(e => e.id === currentUserId ? fn(e) : e))

  const saveWorker = (workerId: string) =>
    updateEmployer(e => ({
      ...e,
      savedWorkerIds: e.savedWorkerIds.includes(workerId)
        ? e.savedWorkerIds
        : [...e.savedWorkerIds, workerId],
    }))

  const unsaveWorker = (workerId: string) =>
    updateEmployer(e => ({
      ...e,
      savedWorkerIds: e.savedWorkerIds.filter(id => id !== workerId),
    }))

  const addHireRequest = (req: Omit<HireRequest, 'id' | 'sentAt' | 'status'>) =>
    updateEmployer(e => ({
      ...e,
      hireRequests: [...e.hireRequests, {
        ...req,
        id:     `hr-${Date.now()}`,
        sentAt: new Date().toISOString(),
        status: 'pending',
      }],
    }))

  // ── Endorsement request APIs ──────────────────────────────────────────────
  const createEndorsementRequest = ({ projectId, clientEmail, clientName }: { projectId?: string; clientEmail?: string; clientName?: string }) => {
    const id = `er-${Date.now()}`
    const token = `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
    const req: EndorsementRequest = { id, token, workerId: currentUserId ?? '', projectId, clientEmail, clientName, status: 'pending', createdAt: new Date().toISOString() }
    setEndorseReqs(prev => [req, ...prev])
    return req
  }

  const getEndorsementRequestByToken = (token: string) => endorseReqs.find(r => r.token === token)

  const completeEndorsementRequest = (token: string, endorsement: Omit<Endorsement, 'id' | 'verified' | 'date'>) => {
    const req = endorseReqs.find(r => r.token === token)
    if (!req) return false
    // find worker
    setWorkers(prev => prev.map(w => {
      if (w.id !== req.workerId) return w
      const newEnd: Endorsement = { ...endorsement, id: `e${Date.now()}`, verified: true, date: new Date().toISOString() }
      return { ...w, endorsements: [newEnd, ...w.endorsements] }
    }))
    // mark project confirmed if projectId present
    if (req.projectId) {
      setWorkers(prev => prev.map(w => {
        if (w.id !== req.workerId) return w
        return { ...w, projects: w.projects.map(p => p.id === req.projectId ? { ...p, confirmed: true, testimonial: endorsement.message, rating: endorsement.rating } : p) }
      }))
    }
    // mark request completed
    setEndorseReqs(prev => prev.map(r => r.token === token ? { ...r, status: 'completed' } : r))
    return true
  }

  return (
    <AppContext.Provider value={{
      currentUserId,
      currentRole,
      isLoggedIn:  !!currentUserId,
      isWorker:    currentRole === 'worker',
      isEmployer:  currentRole === 'employer',
      allWorkers:  workers,
      loginWithPassword, logout, register, registerEmployer, emailExists,
      profile:         activeProfile,
      addSkill, addProject, addEndorsement, confirmProject, completeOnboarding,
      employerProfile,
      saveWorker, unsaveWorker, addHireRequest,
      createEndorsementRequest, getEndorsementRequestByToken, completeEndorsementRequest,
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
