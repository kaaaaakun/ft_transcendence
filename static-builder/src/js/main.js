import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'

function App() {
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
        DefaultButton({ text: '１人対戦' }),
        DefaultButton({ text: 'トーナメント' }),
      ),
    ),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
