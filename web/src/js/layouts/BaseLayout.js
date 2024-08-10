import { Header } from '@/js/components/common/Header'
import { Teact } from '@/js/teact'

export const BaseLayout = children => {
  return Teact.createElement(
    'div',
    null,
    Teact.createElement(Header),
    Teact.createElement('main', { className: 'flex-grow-1' }, children),
  )
}
