import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Loader, Center } from '@mantine/core'
import { router } from './app/routes'

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
      <RouterProvider router={router} />
    </Suspense>
  )
}
