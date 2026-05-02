import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from './Spinner'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return (
      <div className="route-loading" role="status">
        <Spinner label="Checking session" size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return children
}
