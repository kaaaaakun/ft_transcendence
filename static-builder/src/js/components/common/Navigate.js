import { Teact } from '@/js/libs/teact'
import { navigate } from '@/js/libs/router'

export function Navigate({ to, state = {} }) {
  setTimeout(() => {
    navigate(to, state)
  }, 0)
  return Teact.createElement('div', null, 'Redirecting...')
}
