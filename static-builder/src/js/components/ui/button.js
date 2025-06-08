import { Teact } from '@/js/libs/teact'

export const DefaultButton = ({
  type = 'button',
  text,
  onClick,
  className = '',
}) => {
  return Teact.createElement(
    'button',
    {
      type,
      onClick,
      className: `btn btn-primary btn-lg bg-darkblue ${className}`.trim(),
    },
    text,
  )
}
