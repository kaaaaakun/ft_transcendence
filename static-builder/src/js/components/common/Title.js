import { Teact } from '@/js/libs/teact'

export const Title = () => {
  return Teact.createElement(
    'div',
    {
      className: 'text-center',
    },
    Teact.createElement('img', {
      src: '/src/assets/images/title.png',
      alt: 'Title',
      height: '200',
    }),
  )
}
