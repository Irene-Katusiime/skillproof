import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { WorkerProfile, Skill, Project, Endorsement } from '../types'
import { workerProfile as seedProfile } from '../data/mockData'

// ─── Simple hash (demo only) ────────────────────────────────────────────────
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return hash.toString(16)
}

// ─── Types ──────────────────────────────────────────────────────────────────
export type AccountRole = 'worker' | 'employer'

interface Credential {
  workerId: string
  email: string
  passwordHash: string
  role: AccountRole
}

export interface EmployerProfile {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  location: string
  createdAt: string
}

export interface EmployerRegisterData {
  companyName: string
  contactName: string
  email: string
  phone: string
  location: string
}

export type LoginError = 'invalid_credentials' | 'email_not_found' | null

export interface RegisterData {
  name: string
  profession: string
  tagline: string
  location: string
  phone: string
  email: string
  bio: string
}

interface AppContextType {
  currentUserId: string | null
  currentAccountRole: AccountRole | null
  isLoggedIn: boolean
  isWorker: boolean
  isEmployer: boolean

  allWorkers: WorkerProfile[]

  employer: EmployerProfile | null

  loginWithPassword: (
    email: string,
    password: string,
    role?: AccountRole
  ) => LoginError

  logout: () => void

  register: (
    data: RegisterData,
    password: string
  ) => WorkerProfile

  registerEmployer: (
    data: EmployerRegisterData,
    password: string
  ) => EmployerProfile

  emailExists: (email: string) => boolean

  profile: WorkerProfile

  addSkill: (
    skill: Omit<Skill, 'id' | 'verified' | 'endorsements'>
  ) => void

  addProject: (
    project: Omit<Project, 'id' | 'confirmed'>
  ) => void

  addEndorsement: (
    endorsement: Omit<Endorsement, 'id' | 'verified'>
  ) => void

  confirmProject: (
    projectId: string,
    testimonial: string,
    rating: number
  ) => void

  completeOnboarding: () => void
}

// ─── Storage keys ───────────────────────────────────────────────────────────
const KEYS = {
  workers: 'sp_workers_v2',
  credentials: 'sp_creds_v2',
  currentUser: 'sp_current_user',
  currentRole: 'sp_current_role',
  employers: 'sp_employers_v1',
}

// ─── Seed data ──────────────────────────────────────────────────────────────
const SEED_WORKERS: WorkerProfile[] = [
  { ...seedProfile, onboardingComplete: true }
]

const SEED_CREDS: Credential[] = [{
  workerId: seedProfile.id,
  email: seedProfile.email,
  passwordHash: simpleHash('demo1234'),
  role: 'worker',
}]

// ─── Loaders ────────────────────────────────────────────────────────────────
function loadWorkers(): WorkerProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.workers)

    if (raw) {
      const list = JSON.parse(raw) as WorkerProfile[]
      const hasSeed = list.some(w => w.id === seedProfile.id)

      const patched = list.map(w => ({
        ...w,
        onboardingComplete: w.onboardingComplete ?? true,
      }))

      if (!hasSeed) {
        patched.unshift({
          ...seedProfile,
          onboardingComplete: true,
        })
      }

      return patched
    }
  } catch {
    // ignore
  }

  return SEED_WORKERS
}

function loadCredentials(): Credential[] {
  try {
    const raw = localStorage.getItem(KEYS.credentials)

    if (raw) {
      const list = JSON.parse(raw) as Credential[]

      const patched = list.map(c => ({
        ...c,
        role: c.role ?? 'worker',
      }))

      const hasSeed = patched.some(
        c =>
          c.email.toLowerCase() ===
          seedProfile.email.toLowerCase() &&
          c.role === 'worker'
      )

      if (!hasSeed) {
        return [...SEED_CREDS, ...patched]
      }

      return patched
    }
  } catch {
    // ignore
  }

  return SEED_CREDS
}

function loadEmployers(): EmployerProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.employers)

    if (raw) {
      return JSON.parse(raw) as EmployerProfile[]
    }
  } catch {
    // ignore
  }

  return []
}

function loadCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.currentUser)
}

function loadCurrentRole(): AccountRole | null {
  const role = localStorage.getItem(KEYS.currentRole)

  if (role === 'worker' || role === 'employer') {
    return role
  }

  return null
}

// ─── Empty worker profile ───────────────────────────────────────────────────
const EMPTY: WorkerProfile = {
  id: '',
  passportId: '',
  passportIssuedAt: '',
  name: '',
  tagline: '',
  profession: '',
  location: '',
  phone: '',
  email: '',
  yearsActive: 0,
  bio: '',
  completedJobs: 0,
  rating: 0,
  onboardingComplete: false,
  skills: [],
  projects: [],
  assessments: [],
  endorsements: [],
}

// ─── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<WorkerProfile[]>(() => loadWorkers())
  const [credentials, setCredentials] = useState<Credential[]>(() => loadCredentials())
  const [employers, setEmployers] = useState<EmployerProfile[]>(() => loadEmployers())

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(() => loadCurrentUserId())

  const [currentAccountRole, setCurrentAccountRole] =
    useState<AccountRole | null>(() => loadCurrentRole())

  useEffect(() => {
    localStorage.setItem(KEYS.workers, JSON.stringify(workers))
  }, [workers])

  useEffect(() => {
    localStorage.setItem(KEYS.credentials, JSON.stringify(credentials))
  }, [credentials])

  useEffect(() => {
    localStorage.setItem(KEYS.employers, JSON.stringify(employers))
  }, [employers])

  const activeProfile =
    currentAccountRole === 'worker'
      ? workers.find(w => w.id === currentUserId) ?? EMPTY
      : EMPTY

  const activeEmployer =
    currentAccountRole === 'employer'
      ? employers.find(e => e.id === currentUserId) ?? null
      : null

  // ── Sync project confirmations for workers only ──────────────────────────
  useEffect(() => {
    if (!currentUserId || currentAccountRole !== 'worker') return

    const syncConfirmations = async () => {
      try {
        const response = await fetch(
          `/api/project-confirmations/worker/${currentUserId}`
        )

        if (!response.ok) return

        const result = await response.json()

        if (!result.success || !Array.isArray(result.confirmations)) {
          return
        }

        const confirmedProjects = result.confirmations.filter(
          (confirmation: {
            status: string
            projectId: string
          }) => confirmation.status === 'CONFIRMED'
        )

        if (confirmedProjects.length === 0) return

        setWorkers(prev =>
          prev.map(worker => {
            if (worker.id !== currentUserId) return worker

            return {
              ...worker,
              projects: worker.projects.map(project => {
                const confirmation = confirmedProjects.find(
                  (item: { projectId: string }) =>
                    item.projectId === project.id
                )

                if (!confirmation) return project

                return {
                  ...project,
                  confirmed: true,
                }
              }),
            }
          })
        )
      } catch {
        // Backend may be unavailable.
      }
    }

    syncConfirmations()
  }, [currentUserId, currentAccountRole])

  // ── Auth ─────────────────────────────────────────────────────────────────
  const emailExists = (email: string) =>
    credentials.some(
      c => c.email.toLowerCase() === email.toLowerCase()
    )

  const loginWithPassword = (
    email: string,
    password: string,
    role: AccountRole = 'worker'
  ): LoginError => {
    const cred = credentials.find(
      c =>
        c.email.toLowerCase() === email.toLowerCase() &&
        c.role === role
    )

    // IMPORTANT:
    // A worker credential cannot authenticate as employer.
    // An employer credential cannot authenticate as worker.
    if (!cred) return 'email_not_found'

    if (cred.passwordHash !== simpleHash(password)) {
      return 'invalid_credentials'
    }

    localStorage.setItem(KEYS.currentUser, cred.workerId)
    localStorage.setItem(KEYS.currentRole, role)

    setCurrentUserId(cred.workerId)
    setCurrentAccountRole(role)

    return null
  }

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser)
    localStorage.removeItem(KEYS.currentRole)

    setCurrentUserId(null)
    setCurrentAccountRole(null)
  }

  // ── Worker registration ─────────────────────────────────────────────────
  const register = (
    data: RegisterData,
    password: string
  ): WorkerProfile => {
    const id = `worker-${Date.now()}`

    const passportId =
      `SP-${new Date().getFullYear()}-${data.location
        .slice(0, 2)
        .toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    const newWorker: WorkerProfile = {
      ...EMPTY,
      id,
      passportId,
      passportIssuedAt: new Date().toISOString().split('T')[0],
      name: data.name,
      tagline: data.tagline || data.profession,
      profession: data.profession,
      location: data.location,
      phone: data.phone,
      email: data.email,
      bio: data.bio,
      onboardingComplete: false,
    }

    const newCred: Credential = {
      workerId: id,
      email: data.email,
      passwordHash: simpleHash(password),
      role: 'worker',
    }

    setWorkers(prev => [...prev, newWorker])
    setCredentials(prev => [...prev, newCred])

    localStorage.setItem(KEYS.currentUser, id)
    localStorage.setItem(KEYS.currentRole, 'worker')

    setCurrentUserId(id)
    setCurrentAccountRole('worker')

    return newWorker
  }

  // ── Employer registration ────────────────────────────────────────────────
  const registerEmployer = (
    data: EmployerRegisterData,
    password: string
  ): EmployerProfile => {
    const id = `employer-${Date.now()}`

    const newEmployer: EmployerProfile = {
      id,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      createdAt: new Date().toISOString(),
    }

    const newCred: Credential = {
      workerId: id,
      email: data.email,
      passwordHash: simpleHash(password),
      role: 'employer',
    }

    setEmployers(prev => [...prev, newEmployer])
    setCredentials(prev => [...prev, newCred])

    localStorage.setItem(KEYS.currentUser, id)
    localStorage.setItem(KEYS.currentRole, 'employer')

    setCurrentUserId(id)
    setCurrentAccountRole('employer')

    return newEmployer
  }

  // ── Worker mutations ─────────────────────────────────────────────────────
  const updateActive = (
    fn: (p: WorkerProfile) => WorkerProfile
  ) =>
    setWorkers(prev =>
      prev.map(w =>
        w.id === currentUserId ? fn(w) : w
      )
    )

  const addSkill = (
    skill: Omit<Skill, 'id' | 'verified' | 'endorsements'>
  ) =>
    updateActive(p => ({
      ...p,
      skills: [
        ...p.skills,
        {
          ...skill,
          id: `s${Date.now()}`,
          verified: false,
          endorsements: 0,
        },
      ],
    }))

  const addProject = (
    project: Omit<Project, 'id' | 'confirmed'>
  ) =>
    updateActive(p => ({
      ...p,
      projects: [
        {
          ...project,
          id: `p${Date.now()}`,
          confirmed: false,
        },
        ...p.projects,
      ],
      completedJobs: p.completedJobs + 1,
    }))

  const addEndorsement = (
    endorsement: Omit<Endorsement, 'id' | 'verified'>
  ) =>
    updateActive(p => ({
      ...p,
      endorsements: [
        {
          ...endorsement,
          id: `e${Date.now()}`,
          verified: false,
        },
        ...p.endorsements,
      ],
    }))

  const confirmProject = (
    projectId: string,
    testimonial: string,
    rating: number
  ) =>
    updateActive(p => ({
      ...p,
      projects: p.projects.map(proj =>
        proj.id === projectId
          ? {
              ...proj,
              confirmed: true,
              testimonial,
              rating,
            }
          : proj
      ),
    }))

  const completeOnboarding = () =>
    updateActive(p => ({
      ...p,
      onboardingComplete: true,
    }))

  return (
    <AppContext.Provider
      value={{
        currentUserId,
        currentAccountRole,
        isLoggedIn: !!currentUserId,
        isWorker: currentAccountRole === 'worker',
        isEmployer: currentAccountRole === 'employer',

        allWorkers: workers,
        employer: activeEmployer,

        loginWithPassword,
        logout,

        register,
        registerEmployer,
        emailExists,

        profile: activeProfile,

        addSkill,
        addProject,
        addEndorsement,
        confirmProject,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)

  if (!ctx) {
    throw new Error('useApp must be used within AppProvider')
  }

  return ctx
}
