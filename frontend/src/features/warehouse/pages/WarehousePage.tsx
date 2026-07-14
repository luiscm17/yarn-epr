import { useState } from 'react'
import { Stack, Title, Button, Group } from '@mantine/core'
import { PageSkeleton, EmptyState, ErrorState } from '../../../common/components/PageState'

type State = 'loading' | 'empty' | 'error' | 'data'

export default function WarehousePage() {
  const [state, setState] = useState<State>('data')

  if (state === 'loading') return <PageSkeleton />
  if (state === 'empty')
    return (
      <EmptyState
        label="No hay recepciones hoy"
        description="Los fardos recibidos aparecerán aquí cuando se registren."
        action={{ label: 'Registrar recepción', onClick: () => setState('data') }}
      />
    )
  if (state === 'error')
    return (
      <ErrorState
        message="No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo."
        onRetry={() => setState('data')}
      />
    )

  return (
    <Stack>
      <Title order={2}>Recepción de fardos</Title>
      <Group>
        <Button variant="light" color="gray" onClick={() => setState('loading')}>
          Mostrar loading
        </Button>
        <Button variant="light" color="gray" onClick={() => setState('empty')}>
          Mostrar empty
        </Button>
        <Button variant="light" color="red" onClick={() => setState('error')}>
          Mostrar error
        </Button>
      </Group>
    </Stack>
  )
}
