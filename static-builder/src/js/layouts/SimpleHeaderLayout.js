import { Header } from '@/js/components/common/Header'
import { Teact } from '@/js/libs/teact'

export const SimpleHeaderLayout = (...nodes) => {
  const flatChildren = nodes
    .flatMap(node => (Array.isArray(node) ? node : [node]))
    .filter(Boolean)

  return Teact.createElement(
    'div',
    null,
    Teact.createElement(Header),
    Teact.createElement(
      'main',
      { className: 'flex-grow-1 py-5' },
      ...flatChildren,
    ),
  )
}
