import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Alert,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import classes from '../../../styles/components/LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname || '/almacen/recepcion'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Si ya está autenticado, redirigir
  if (isAuthenticated) {
    navigate(from, { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Completá ambos campos para iniciar sesión')
      return
    }

    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch {
      setError('Credenciales inválidas. Intentalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={classes.wrapper}>
      <Paper
        className={classes.card}
        p="xl"
        radius="md"
        withBorder
      >
        <Title order={1} size="h2" ta="center" mb="xs">
          Yarn EPR
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Producción textil — Iniciar sesión
        </Text>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              mb="md"
              styles={{ body: { fontSize: '14px' } }}
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Usuario"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            autoFocus
            mb="sm"
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mb="lg"
          />

          <Button type="submit" fullWidth loading={loading}>
            Ingresar
          </Button>
        </form>
      </Paper>
    </div>
  )
}
