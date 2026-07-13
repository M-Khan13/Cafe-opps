import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import { ClipboardList, CheckSquare, UtensilsCrossed, LayoutGrid, ListChecks } from 'lucide-react'

// Staff sections
import TakeOrder from '@/components/TakeOrder'
import MyTasks from '@/components/MyTasks'
import StaffMenu from '@/components/StaffMenu'

// Admin sections
import OrderFeed from '@/components/OrderFeed'
import MenuManagement from '@/components/MenuManagement'
import TaskBoard from '@/components/TaskBoard'

const staffNav = [
  { to: '/staff/order', label: 'Take Order', icon: ClipboardList },
  { to: '/staff/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/staff/menu', label: 'Menu', icon: UtensilsCrossed },
]

const adminNav = [
  { to: '/admin/orders', label: 'Orders', icon: LayoutGrid },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/tasks', label: 'Tasks', icon: ListChecks },
]

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Staff */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredRole="staff">
            <Layout navItems={staffNav} roleLabel="Barista" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/order" replace />} />
        <Route path="order" element={<TakeOrder />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="menu" element={<StaffMenu />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout navItems={adminNav} roleLabel="Owner" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/orders" replace />} />
        <Route path="orders" element={<OrderFeed />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="tasks" element={<TaskBoard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App