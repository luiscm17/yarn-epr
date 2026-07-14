import {
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Box,
  useMantineColorScheme,
} from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import { navData, type NavItem } from '../navigation-data'
import classes from '../../styles/components/Sidebar.module.css'

interface SidebarProps {
  /**
   * Callback opcional para filtrado RBAC.
   * Recibe el resourceType del item y devuelve true si el usuario tiene acceso.
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

export function Sidebar({ isResourceAllowed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  const visibleNavData = isResourceAllowed
    ? filterNavItems(navData, isResourceAllowed)
    : navData

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
