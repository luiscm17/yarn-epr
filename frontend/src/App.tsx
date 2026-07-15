import { Suspense } from 'react'
import { Loader, Center } from '@mantine/core'
import { AppRouter } from './app/routes'

function Fallback() {
  return (
    <Center h="100vh">
      <Loader />
    </Center>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <AppRouter />
    </Suspense>
  )
}
