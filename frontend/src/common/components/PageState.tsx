import {
  Skeleton,
  Stack,
  Center,
  Text,
  Button,
  type StackProps,
} from '@mantine/core'
import { IconAlertCircle, IconInboxOff } from '@tabler/icons-react'

/* -----------------------------------------------
   Loading — skeleton con la forma típica de página
   ----------------------------------------------- */
export function PageSkeleton(props: StackProps) {
  return (
    <Stack gap="md" {...props}>
      <Skeleton height={12} width="40%" />
      <Skeleton height={24} width="60%" />
      <Skeleton height={10} />
      <Skeleton height={10} width="80%" />
      <Skeleton height={10} width="50%" />
      <Skeleton height={200} mt="md" />
    </Stack>
  )
}

/* -----------------------------------------------
   Empty — cuando no hay datos que mostrar
   ----------------------------------------------- */
interface EmptyStateProps {
  label?: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({
  label = 'Sin datos',
  description,
  action,
}: EmptyStateProps) {
  return (
    <Center h={300}>
      <Stack align="center" gap="xs">
        <IconInboxOff
          size={40}
          style={{ color: 'var(--mantine-color-dimmed)' }}
        />
        <Text size="md" fw={500} c="dimmed">
          {label}
        </Text>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
        {action && (
          <Button variant="light" size="xs" mt="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Stack>
    </Center>
  )
}

/* -----------------------------------------------
   Error — cuando falló la carga de datos
   ----------------------------------------------- */
interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Ocurrió un error al cargar los datos',
  onRetry,
}: ErrorStateProps) {
  return (
    <Center h={300}>
      <Stack align="center" gap="xs">
        <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
        <Text size="md" fw={500} c="red">
          Error
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={400}>
          {message}
        </Text>
        {onRetry && (
          <Button variant="light" color="red" size="xs" mt="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </Stack>
    </Center>
  )
}
