import { useState } from 'react'
import {
  AppShell,
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Indicator,
  Avatar,
  Menu,
  rem,
} from '@mantine/core'
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

export function AppLayout() {
  const navigate = useNavigate()
  const [sidebarOpened, setSidebarOpened] = useState(true)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const { user, logout } = useAuth()

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { desktop: !sidebarOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <TopBar
          left={
            <>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setSidebarOpened((o) => !o)}
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
                onClick={toggleColorScheme}
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

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
