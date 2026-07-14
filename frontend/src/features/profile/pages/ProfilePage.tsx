import {
  Avatar,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Divider,
  Grid,
  Badge,
} from '@mantine/core'
import { useAuth } from '../../auth/context/auth-context'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Stack gap="lg">
      <Title order={2}>Mi perfil</Title>

      {/* Avatar + nombre */}
      <Card withBorder radius="md" padding="lg">
        <Group gap="lg" wrap="nowrap">
          <Avatar
            size={80}
            color="brand-cyan"
            radius={100}
            name={user.name}
          >
            {user.initials}
          </Avatar>

          <Stack gap={4}>
            <Text size="xl" fw={600}>
              {user.name}
            </Text>
            <Text size="sm" c="dimmed">
              @{user.username}
            </Text>
          </Stack>
        </Group>
      </Card>

      {/* Datos de cuenta */}
      <Card withBorder radius="md" padding="lg">
        <Text fw={500} mb="md">
          Datos de cuenta
        </Text>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Usuario
            </Text>
            <Text>{user.username}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Nombre
            </Text>
            <Text>{user.name}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Permisos */}
      {user.allowedResources.length > 0 && (
        <>
          <Divider />
          <Card withBorder radius="md" padding="lg">
            <Text fw={500} mb="md">
              Accesos
            </Text>
            <Group gap="xs">
              {user.allowedResources.map((r) => (
                <Badge key={r} variant="light" color="brand-cyan">
                  {r}
                </Badge>
              ))}
            </Group>
          </Card>
        </>
      )}
    </Stack>
  )
}
