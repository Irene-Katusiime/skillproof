import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ONBOARDING_PATHS = [
  '/onboarding/story',
  '/onboarding/ai-skills',
  '/onboarding/prove',
  '/onboarding/verified',
]

export default function RequireAuth() {
  const { isLoggedIn, profile } = useApp()
  const location = useLocation()

  // Not logged in → go to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but onboarding incomplete → redirect to onboarding
  // (unless they're already on an onboarding step)
  const onOnboarding = ONBOARDING_PATHS.some(p => location.pathname.startsWith(p))
  if (!profile.onboardingComplete && !onOnboarding) {
    return <Navigate to="/onboarding/story" replace />
  }

  return <Outlet />
}
