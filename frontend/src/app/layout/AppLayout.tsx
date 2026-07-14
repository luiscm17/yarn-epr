import {
  AppShell,
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Indicator,
  Avatar,
  Menu,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSun,
  IconMoon,
  IconChevronDown,
  IconMenu2,
} from '@tabler/icons-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../features/auth/context/AuthContext'
import { ErrorBoundary } from '../../common/components/ErrorBoundary'
import { usePageTitle } from '../../common/hooks/usePageTitle'

export function AppLayout() {
  usePageTitle()
  const navigate = useNavigate()
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false)
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const { setColorScheme } = useMantineColorScheme()
  const computedScheme = useComputedColorScheme('light')
  const isDark = computedScheme === 'dark'
  const { user, logout } = useAuth()

  const handleToggleSidebar = () => {
    // Consulta síncrona — sin flicker de hidratación
    if (window.matchMedia('(max-width: 48em)').matches) {
      toggleMobile()
    } else {
      toggleDesktop()
    }
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={{ base: 'sm', sm: 'md' }}
    >
      <AppShell.Header>
        <TopBar
          left={
            <>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <IconMenu2 style={{ width: rem(18) }} />
              </ActionIcon>

              <Text size="lg" fw={700} c="brand-cyan.3">
                Yarn EPR
              </Text>
            </>
          }
          right={
            <Group gap="sm" wrap="nowrap">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setColorScheme(isDark ? 'light' : 'dark')
                }
                aria-label="Toggle color scheme"
              >
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>

              <Menu shadow="md" width={180}>
                <Menu.Target>
                  <Group gap={6} style={{ cursor: 'pointer' }} wrap="nowrap">
                    <Indicator size={8} offset={2} color="green" withBorder>
                      <Avatar size={28} color="brand-cyan" radius="xl">
                        {user?.initials ?? '?'}
                      </Avatar>
                    </Indicator>
                    <Text size="sm" visibleFrom="sm">
                      {user?.name ?? 'Usuario'}
                    </Text>
                    <IconChevronDown
                      size={14}
                      style={{ color: 'var(--mantine-color-dimmed)' }}
                    />
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Usuario</Menu.Label>
                  <Menu.Item>Perfil</Menu.Item>
                  <Menu.Item
                    color="red"
                    onClick={() => {
                      logout()
                      navigate('/login', { replace: true })
                    }}
                  >
                    Cerrar sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          }
        />
      </AppShell.Header>

      <AppShell.Navbar
        bg={isDark ? 'dark.7' : 'gray.0'}
      >
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <ErrorBoundary>
          <div className="page-enter">
            <Outlet />
          </div>
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  )
}
