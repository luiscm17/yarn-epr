import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'))
const NotFoundPage = lazy(() => import('../../features/not-found/pages/NotFoundPage'))
const WarehousePage = lazy(() => import('../../features/warehouse/pages/WarehousePage'))
const SpinningPage = lazy(() => import('../../features/spinning/pages/SpinningPage'))
const LotsPage = lazy(() => import('../../features/lots/pages/LotsPage'))
const ReportsPage = lazy(() => import('../../features/reports/pages/ReportsPage'))
const AdminPage = lazy(() => import('../../features/admin/pages/AdminPage'))
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'))

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/warehouse/reception" replace /> },
      { path: 'warehouse/reception', element: <WarehousePage /> },
      { path: 'warehouse/identity', element: <WarehousePage /> },
      { path: 'warehouse/issue', element: <WarehousePage /> },
      { path: 'warehouse/finished-product', element: <WarehousePage /> },
      { path: 'warehouse/classification', element: <WarehousePage /> },
      { path: 'warehouse/exits', element: <WarehousePage /> },
      { path: 'warehouse/supplies', element: <WarehousePage /> },
      { path: 'warehouse/stock', element: <WarehousePage /> },
      { path: 'spinning/dashboard', element: <SpinningPage /> },
      { path: 'spinning/unloads', element: <SpinningPage /> },
      { path: 'spinning/progress', element: <SpinningPage /> },
      { path: 'spinning/quality', element: <SpinningPage /> },
      { path: 'spinning/waste', element: <SpinningPage /> },
      { path: 'spinning/skeins', element: <SpinningPage /> },
      { path: 'spinning/consolidated', element: <SpinningPage /> },
      { path: 'lots/queue', element: <LotsPage /> },
      { path: 'lots/detail', element: <LotsPage /> },
      { path: 'reports/daily', element: <ReportsPage /> },
      { path: 'reports/production', element: <ReportsPage /> },
      { path: 'reports/traceability', element: <ReportsPage /> },
      { path: 'admin/master-data', element: <AdminPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
