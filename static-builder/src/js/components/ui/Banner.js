import { Teact } from '@/js/libs/teact'

export const Banner = ({ type, message, onClose }) => {
  const [isClosed, setIsClosed] = Teact.useState(false)

  const handleClose = () => {
    setIsClosed(true)
    if (onClose) {
      onClose()
    }
  }

  const style =
    type === 'error'
      ? 'alert-danger'
      : type === 'warning'
        ? 'alert-warning'
        : 'alert-info'

  return (
    !isClosed &&
    Teact.createElement(
      'div',
      { className: `alert alert-dismissible fade show banner ${style}` },
      message,
      Teact.createElement('button', {
        type: 'button',
        className: 'btn-close',
        onClick: handleClose,
      }),
    )
  )
}
