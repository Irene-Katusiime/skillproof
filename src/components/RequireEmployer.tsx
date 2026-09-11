import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function RequireEmployer() {
  const { isLoggedIn, isEmployer } = useApp()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isEmployer) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
