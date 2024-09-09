import { Header } from '@/js/components/common/Header'
import { Title } from '@/js/components/common/Title'
import { Teact } from '@/js/libs/teact'

export const BaseLayout = children => {
  return Teact.createElement(
    'div',
    null,
    Teact.createElement(Header),
    Teact.createElement(Title),
    Teact.createElement('main', { className: 'flex-grow-1' }, children),
  )
}
