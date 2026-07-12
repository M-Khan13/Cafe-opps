import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import AdminDashboard from '@/pages/AdminDashboard'
import StaffDashboard from '@/pages/StaffDashboard'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App