import '@/scss/styles.scss'
import javascriptLogo from '@/assets/images/javascript.svg'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'
import viteLogo from '/vite.svg'

function App() {
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'h3',
        { className: 'mb-5 text-center text-light' },
        '遊ぶモードを選んでください'
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        Teact.createElement(
          'button',
          { className: 'btn btn-primary btn-lg bg-darkblue', type: 'submit' },
          '２人対戦'
        ),
        Teact.createElement(
          'button',
          { className: 'btn btn-primary btn-lg bg-darkblue', type: 'submit' },
          'トーナメント'
        )
      ),
    ),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
