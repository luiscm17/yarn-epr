import {
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Box,
  useMantineColorScheme,
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
import classes from './Sidebar.module.css'

interface NavItem {
  label: string
  path?: string
  icon?: React.ReactNode
  children?: NavItem[]
}

const navData: NavItem[] = [
  {
    label: 'Almacén',
    icon: <IconBuildingWarehouse size={18} />,
    children: [
      { label: 'Recepción de fardos', path: '/almacen/recepcion', icon: <IconPackage size={16} /> },
      { label: 'Identidad de producción', path: '/almacen/identidad', icon: <IconBarcode size={16} /> },
      { label: 'Emisión a Operación', path: '/almacen/emision', icon: <IconTruckDelivery size={16} /> },
      { label: 'Recepción de PT', path: '/almacen/pt', icon: <IconPackageImport size={16} /> },
      { label: 'Clasificación / disponibilidad', path: '/almacen/clasificacion', icon: <IconCategory size={16} /> },
      { label: 'Salidas y devoluciones', path: '/almacen/salidas', icon: <IconArrowUpRight size={16} /> },
      { label: 'Insumos', path: '/almacen/insumos', icon: <IconBoxSeam size={16} /> },
      { label: 'Stock e historial', path: '/almacen/stock', icon: <IconHistory size={16} /> },
    ],
  },
  {
    label: 'Hilatura',
    icon: <IconSpiral size={18} />,
    children: [
      { label: 'Dashboard por sección', path: '/hilatura/dashboard', icon: <IconDashboard size={16} /> },
      { label: 'Descargas', path: '/hilatura/descargas', icon: <IconClipboardList size={16} /> },
      { label: 'Avance', path: '/hilatura/avance', icon: <IconChartBar size={16} /> },
      { label: 'Calidad de proceso', path: '/hilatura/calidad', icon: <IconSitemap size={16} /> },
      { label: 'Desperdicio', path: '/hilatura/desperdicio', icon: <IconTrash size={16} /> },
      { label: 'Disponibilidad de madejas', path: '/hilatura/madejas', icon: <IconStack3 size={16} /> },
      { label: 'Consolidado por turno', path: '/hilatura/consolidado', icon: <IconFileAnalytics size={16} /> },
    ],
  },
  {
    label: 'Proceso por Lotes',
    icon: <IconStack3 size={18} />,
    children: [
      { label: 'Cola de lotes', path: '/lotes/cola', icon: <IconListDetails size={16} /> },
      { label: 'Detalle del lote', path: '/lotes/detalle', icon: <IconRoute size={16} /> },
    ],
  },
  {
    label: 'Reportes',
    icon: <IconReport size={18} />,
    children: [
      { label: 'Consolidado diario', path: '/reportes/diario', icon: <IconFileAnalytics size={16} /> },
      { label: 'Producción vs plan', path: '/reportes/produccion', icon: <IconChartBar size={16} /> },
      { label: 'Trazabilidad de lote', path: '/reportes/trazabilidad', icon: <IconRoute size={16} /> },
    ],
  },
  {
    label: 'Admin',
    icon: <IconSettings size={18} />,
    children: [{ label: 'Datos maestros', path: '/admin/datos-maestros', icon: <IconSettings size={16} /> }],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

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
            {navData.map((section) => (
              <NavLink
                key={section.label}
                label={section.label}
                leftSection={section.icon}
                defaultOpened={section.children?.some(
                  (child) => location.pathname === child.path
                )}
                variant="light"
                color="gray"
              >
                {section.children?.map((child) => (
                  <NavLink
                    key={child.path}
                    label={child.label}
                    leftSection={child.icon}
                    active={location.pathname === child.path}
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
