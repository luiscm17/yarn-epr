import { Center, Stack, Title, Text, Button } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

interface ErrorFallbackProps {
  error?: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <Center h="100%">
      <Stack align="center" gap="xs" px="md">
        <IconAlertTriangle
          size={40}
          style={{ color: 'var(--mantine-color-red-6)' }}
        />
        <Title order={2} size="h3">
          Algo salió mal
        </Title>
        <Text c="dimmed" size="sm" ta="center" maw={400}>
          Ocurrió un error inesperado al cargar esta sección.
          {error && import.meta.env.DEV && (
            <>
              <br />
              <Text
                component="code"
                size="xs"
                c="red"
                style={{ display: 'block', marginTop: '8px' }}
              >
                {error.message}
              </Text>
            </>
          )}
        </Text>
        {reset && (
          <Button variant="light" onClick={reset} mt="sm">
            Reintentar
          </Button>
        )}
      </Stack>
    </Center>
  )
}
