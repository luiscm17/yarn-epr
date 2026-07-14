import {
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Box,
  Tooltip,
  useMantineColorScheme,
  type MantineStyleProp,
} from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
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
import classes from '../../styles/components/Sidebar.module.css'

interface NavItem {
  label: string
  path?: string
  icon?: React.ReactNode
  /** Identificador para filtrado RBAC (resource_type_code del backend) */
  resourceType?: string
  children?: NavItem[]
}

const navData: NavItem[] = [
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

interface SidebarProps {
  expanded: boolean
  /**
   * Callback opcional para filtrado RBAC.
   * Recibe el `resourceType` del item y devuelve true si el usuario tiene acceso.
   * Si no se provee, todos los items son visibles.
   */
  isResourceAllowed?: (resourceType: string) => boolean
}

function filterNavItems(
  items: NavItem[],
  isAllowed: (rt: string) => boolean,
): NavItem[] {
  return items
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter(
          (c) => !c.resourceType || isAllowed(c.resourceType),
        )
        if (filteredChildren.length === 0) return null
        return { ...item, children: filteredChildren }
      }
      if (item.resourceType && !isAllowed(item.resourceType)) return null
      return item
    })
    .filter(Boolean) as NavItem[]
}

export function Sidebar({ expanded, isResourceAllowed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // Filtrar por RBAC si el callback está presente
  const visibleNavData = isResourceAllowed
    ? filterNavItems(navData, isResourceAllowed)
    : navData

  const isActive = (path: string) => location.pathname === path

  // ── Utility: estilo compacto para NavLink en mini mode ──
  const miniLinkStyles: MantineStyleProp = {
    padding: '6px 10px',
    justifyContent: 'center',
    width: 36,
    height: 36,
  }

  // ── Mini sidebar: iconos con Tooltip ──
  if (!expanded) {
    return (
      <div className={classes.miniList}>
        {visibleNavData.map((section) => (
          <div key={section.label}>
            {section.children?.map((child) => (
              <Tooltip
                key={child.path}
                label={child.label}
                position="right"
                openDelay={400}
                withinPortal
              >
                <NavLink
                  label=""
                  leftSection={child.icon}
                  active={isActive(child.path!)}
                  onClick={() => navigate(child.path!)}
                  variant="subtle"
                  color="gray"
                  className={classes.miniNavRoot}
                  style={miniLinkStyles}
                />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // ── Expanded sidebar: full labels ──
  return (
    <>
      <Text
        size="xs"
        fw={600}
        c={isDark ? 'gray.5' : 'gray.6'}
        px="md"
        pt="md"
        pb="xs"
        tt="uppercase"
        className={classes.sectionLabel}
      >
        Navegación
      </Text>

      <Box className={classes.scrollArea}>
        <ScrollArea px="xs">
          <Stack gap={2}>
            {visibleNavData.map((section) => (
              <NavLink
                key={section.label}
                label={section.label}
                leftSection={section.icon}
                defaultOpened={section.children?.some(
                  (child) => location.pathname === child.path,
                )}
                variant="light"
                color="gray"
              >
                {section.children?.map((child) => (
                  <NavLink
                    key={child.path}
                    label={child.label}
                    leftSection={child.icon}
                    active={isActive(child.path!)}
                    onClick={() => navigate(child.path!)}
                    variant="subtle"
                    color="gray"
                  />
                ))}
              </NavLink>
            ))}
          </Stack>
        </ScrollArea>
      </Box>
    </>
  )
}
