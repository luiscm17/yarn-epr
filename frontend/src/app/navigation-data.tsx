import type { ReactNode } from 'react'
import {
  IconBuildingWarehouse,
  IconSpiral,
  IconStack3,
  IconReport,
  IconSettings,
  IconPackage,
  IconBarcode,
  IconTruckDelivery,
  IconPackageImport,
  IconCategory,
  IconArrowUpRight,
  IconHistory,
  IconBoxSeam,
  IconDashboard,
  IconClipboardList,
  IconChartBar,
  IconTrash,
  IconSitemap,
  IconListDetails,
  IconFileAnalytics,
  IconRoute,
} from '@tabler/icons-react'

export interface NavItem {
  label: string
  path?: string
  icon?: ReactNode
  resourceType?: string
  children?: NavItem[]
}

export const navData: NavItem[] = [
  {
    label: 'Almacén',
    icon: <IconBuildingWarehouse size={18} />,
    resourceType: 'warehouse',
    children: [
      { label: 'Recepción de fardos', path: '/almacen/recepcion', icon: <IconPackage size={16} />, resourceType: 'warehouse:recepcion' },
      { label: 'Identidad de producción', path: '/almacen/identidad', icon: <IconBarcode size={16} />, resourceType: 'warehouse:identidad' },
      { label: 'Emisión a Operación', path: '/almacen/emision', icon: <IconTruckDelivery size={16} />, resourceType: 'warehouse:emision' },
      { label: 'Recepción de PT', path: '/almacen/pt', icon: <IconPackageImport size={16} />, resourceType: 'warehouse:pt' },
      { label: 'Clasificación / disponibilidad', path: '/almacen/clasificacion', icon: <IconCategory size={16} />, resourceType: 'warehouse:clasificacion' },
      { label: 'Salidas y devoluciones', path: '/almacen/salidas', icon: <IconArrowUpRight size={16} />, resourceType: 'warehouse:salidas' },
      { label: 'Insumos', path: '/almacen/insumos', icon: <IconBoxSeam size={16} />, resourceType: 'warehouse:insumos' },
      { label: 'Stock e historial', path: '/almacen/stock', icon: <IconHistory size={16} />, resourceType: 'warehouse:stock' },
    ],
  },
  {
    label: 'Hilatura',
    icon: <IconSpiral size={18} />,
    resourceType: 'spinning',
    children: [
      { label: 'Dashboard por sección', path: '/hilatura/dashboard', icon: <IconDashboard size={16} />, resourceType: 'spinning:dashboard' },
      { label: 'Descargas', path: '/hilatura/descargas', icon: <IconClipboardList size={16} />, resourceType: 'spinning:descargas' },
      { label: 'Avance', path: '/hilatura/avance', icon: <IconChartBar size={16} />, resourceType: 'spinning:avance' },
      { label: 'Calidad de proceso', path: '/hilatura/calidad', icon: <IconSitemap size={16} />, resourceType: 'spinning:calidad' },
      { label: 'Desperdicio', path: '/hilatura/desperdicio', icon: <IconTrash size={16} />, resourceType: 'spinning:desperdicio' },
      { label: 'Disponibilidad de madejas', path: '/hilatura/madejas', icon: <IconStack3 size={16} />, resourceType: 'spinning:madejas' },
      { label: 'Consolidado por turno', path: '/hilatura/consolidado', icon: <IconFileAnalytics size={16} />, resourceType: 'spinning:consolidado' },
    ],
  },
  {
    label: 'Proceso por Lotes',
    icon: <IconStack3 size={18} />,
    resourceType: 'lots',
    children: [
      { label: 'Cola de lotes', path: '/lotes/cola', icon: <IconListDetails size={16} />, resourceType: 'lots:cola' },
      { label: 'Detalle del lote', path: '/lotes/detalle', icon: <IconRoute size={16} />, resourceType: 'lots:detalle' },
    ],
  },
  {
    label: 'Reportes',
    icon: <IconReport size={18} />,
    resourceType: 'reports',
    children: [
      { label: 'Consolidado diario', path: '/reportes/diario', icon: <IconFileAnalytics size={16} />, resourceType: 'reports:diario' },
      { label: 'Producción vs plan', path: '/reportes/produccion', icon: <IconChartBar size={16} />, resourceType: 'reports:produccion' },
      { label: 'Trazabilidad de lote', path: '/reportes/trazabilidad', icon: <IconRoute size={16} />, resourceType: 'reports:trazabilidad' },
    ],
  },
  {
    label: 'Admin',
    icon: <IconSettings size={18} />,
    resourceType: 'admin',
    children: [{ label: 'Datos maestros', path: '/admin/datos-maestros', icon: <IconSettings size={16} />, resourceType: 'admin:datos-maestros' }],
  },
]
