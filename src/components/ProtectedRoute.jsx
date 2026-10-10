import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles?.length && !roles.includes(user?.role)) {
    const home = user?.role === 'PATIENT' ? '/book' : '/dashboard'
    return <Navigate to={home} replace />
  }
  return children
}

export default ProtectedRoute
