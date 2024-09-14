import { Teact } from '@/js/libs/teact'

export const DefaultButton = ({ type = 'button', text, onClick }) => {
  return Teact.createElement(
    'button',
    {
      type: type,
      className: 'btn btn-primary btn-lg bg-darkblue',
      onClick: onClick,
    },
    `${text}`,
  )
}
