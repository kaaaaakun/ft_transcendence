import { Teact } from '@/js/libs/teact'

export const ConnectionStatus = ({ connectionStatus, roomName }) => {
  const statusConfig = {
    connecting: {
      text: 'Connecting to tournament...',
      className: 'alert-info',
      showRoom: false,
    },
    connected: {
      text: `Connected to room: ${roomName}`,
      className: 'alert-success',
      showRoom: true,
    },
    disconnected: {
      text: 'Disconnected from tournament',
      className: 'alert-warning',
      showRoom: false,
    },
    error: {
      text: 'Connection error occurred',
      className: 'alert-danger',
      showRoom: false,
    },
  }

  const config = statusConfig[connectionStatus] || statusConfig.error

  return Teact.createElement(
    'div',
    { className: `alert ${config.className} mb-3` },
    config.text,
  )
}
