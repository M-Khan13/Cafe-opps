import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  // Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → send to their own dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/staff'} replace />
  }

  // All good → show the page
  return children
}

export default ProtectedRoute
