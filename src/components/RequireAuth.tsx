import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ONBOARDING_PATHS = [
  '/onboarding/story',
  '/onboarding/ai-skills',
  '/onboarding/prove',
  '/onboarding/verified',
]

export default function RequireAuth() {
  const { isLoggedIn, isEmployer, profile } = useApp()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Employer logged in but hit a worker route → redirect to employer portal
  if (isEmployer) {
    return <Navigate to="/employer/dashboard" replace />
  }

  // Worker onboarding incomplete → redirect to onboarding
  const onOnboarding = ONBOARDING_PATHS.some(p => location.pathname.startsWith(p))
  if (!profile.onboardingComplete && !onOnboarding) {
    return <Navigate to="/onboarding/story" replace />
  }

  return <Outlet />
}
