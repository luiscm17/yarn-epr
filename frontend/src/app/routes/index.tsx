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
      { index: true, element: <Navigate to="/almacen/recepcion" replace /> },
      { path: 'almacen/recepcion', element: <WarehousePage /> },
      { path: 'almacen/identidad', element: <WarehousePage /> },
      { path: 'almacen/emision', element: <WarehousePage /> },
      { path: 'almacen/pt', element: <WarehousePage /> },
      { path: 'almacen/clasificacion', element: <WarehousePage /> },
      { path: 'almacen/salidas', element: <WarehousePage /> },
      { path: 'almacen/insumos', element: <WarehousePage /> },
      { path: 'almacen/stock', element: <WarehousePage /> },
      { path: 'hilatura/dashboard', element: <SpinningPage /> },
      { path: 'hilatura/descargas', element: <SpinningPage /> },
      { path: 'hilatura/avance', element: <SpinningPage /> },
      { path: 'hilatura/calidad', element: <SpinningPage /> },
      { path: 'hilatura/desperdicio', element: <SpinningPage /> },
      { path: 'hilatura/madejas', element: <SpinningPage /> },
      { path: 'hilatura/consolidado', element: <SpinningPage /> },
      { path: 'lotes/cola', element: <LotsPage /> },
      { path: 'lotes/detalle', element: <LotsPage /> },
      { path: 'reportes/diario', element: <ReportsPage /> },
      { path: 'reportes/produccion', element: <ReportsPage /> },
      { path: 'reportes/trazabilidad', element: <ReportsPage /> },
      { path: 'admin/datos-maestros', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
