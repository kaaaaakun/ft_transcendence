import DefaultButton from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'

export const Home = () => {
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'h3',
        { className: 'mb-5 text-center text-light' },
        '遊ぶモードを選んでください',
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({ text: '１人対戦', onClick: () => navigate('/game') }), // TBD
        DefaultButton({
          text: 'トーナメント',
          onClick: () => navigate('/tournament'),
        }), // TBD
      ),
    ),
  )
}
