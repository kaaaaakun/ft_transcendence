import { Teact } from '@/js/libs/teact'

export const Banner = ({
  type, // TODO: 'info' | 'warning' | 'error' でスタイルを変更するのに使う
  message,
  onClose,
}) => {
  const [isClosed, setIsClosed] = Teact.useState(false)

  const handleClose = () => {
    setIsClosed(true)
    if (onClose) {
      onClose()
    }
  }

  return !isClosed && Teact.createElement(
    'div',
    { className: 'alert alert-warning alert-dismissible fade show banner' },
    message,
    Teact.createElement(
      'button',
      {
        type: 'button',
        className: 'btn-close',
        onClick: handleClose,
      },
    ),
  )
}