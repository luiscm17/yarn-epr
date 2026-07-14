import { notifications } from '@mantine/notifications'

/**
 * Notificaciones consistentes para toda la app.
 * Se puede llamar desde hooks, efectos, o handlers de formularios.
 */
export function useNotify() {
  return {
    success(message: string, title?: string) {
      notifications.show({
        title,
        message,
        color: 'green',
        autoClose: 3000,
      })
    },

    error(message: string, title?: string) {
      notifications.show({
        title,
        message,
        color: 'red',
        autoClose: 5000,
      })
    },

    warning(message: string, title?: string) {
      notifications.show({
        title,
        message,
        color: 'orange',
        autoClose: 4000,
      })
    },

    info(message: string, title?: string) {
      notifications.show({
        title,
        message,
        color: 'blue',
        autoClose: 3000,
      })
    },
  }
}
