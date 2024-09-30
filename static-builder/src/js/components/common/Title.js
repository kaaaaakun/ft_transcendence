import { Teact } from '@/js/libs/teact'
import TitleImage from '/title.png'

export const Title = () => {
  return Teact.createElement(
    'div',
    {
      className: 'text-center',
    },
    Teact.createElement('img', {
      src: TitleImage,
      alt: 'Title',
      height: '200',
    }),
  )
}
