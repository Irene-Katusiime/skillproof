import { Navigate, Outlet } from 'react-router-dom'
import { useApp, type AccountRole } from '../context/AppContext'

export default function RequireRole({
  role,
}: {
  role: AccountRole
}) {
  const {
    isLoggedIn,
    currentAccountRole,
  } = useApp()

  if (!isLoggedIn) {
    return (
      <Navigate
        to={role === 'employer' ? '/employer/login' : '/login'}
        replace
      />
    )
  }

  if (currentAccountRole !== role) {
    return (
      <Navigate
        to={
          currentAccountRole === 'employer'
            ? '/employer/dashboard'
            : '/dashboard'
        }
        replace
      />
    )
  }

  return <Outlet />
}
