import { Header } from '@/js/components/common/Header'
import { Teact } from '@/js/libs/teact'

export const SimpleHeaderLayout = children => {
  return Teact.createElement(
    'div',
    null,
    Teact.createElement(Header),
    Teact.createElement('main', { className: 'flex-grow-1 py-5' }, children),
  )
}
