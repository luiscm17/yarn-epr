import {
  AppShell,
  ScrollArea,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core'
import { navData, type NavItem } from '../navigation-data'
import { SidebarLinksGroup } from './SidebarLinksGroup'
import classes from '../../styles/components/Sidebar.module.css'

interface SidebarProps {
  /**
   * Optional RBAC filter callback.
   * Receives the item's resourceType, returns true if the user has access.
   * When omitted, all items are visible.
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
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  const visibleNavData = isResourceAllowed
    ? filterNavItems(navData, isResourceAllowed)
    : navData

  return (
    <>
      <AppShell.Section>
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
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Stack gap={0} px="xs">
          {visibleNavData.map((section) => (
            <SidebarLinksGroup
              key={section.label}
              icon={section.icon}
              label={section.label}
              links={section.children}
            />
          ))}
        </Stack>
      </AppShell.Section>
    </>
  )
}
