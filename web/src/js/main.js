import '@/scss/styles.scss'
import javascriptLogo from '@/assets/images/javascript.svg'
import { Teact } from '@/js/teact'
import viteLogo from '/vite.svg'

function App() {
  const [state, setState] = Teact.useState(1)
  return Teact.createElement(
    'div',
    { className: 'container, pt-5 vh-100' },
    Teact.createElement(
      'div',
      { className: 'd-flex justify-content-center' },
      Teact.createElement(
        'a',
        { className: 'mx-4', href: 'https://vitejs.dev', target: '_blank' },
        Teact.createElement('img', {
          src: viteLogo,
          className: 'img-fluid',
          alt: 'Vite logo',
        }),
      ),
      Teact.createElement(
        'a',
        {
          className: 'mx-4',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
          target: '_blank',
        },
        Teact.createElement('img', {
          src: javascriptLogo,
          className: 'img-fluid',
          alt: 'JavaScript logo',
        }),
      ),
    ),
    Teact.createElement('h1', { className: 'text-center pt-5' }, 'Hello Vite!'),
    Teact.createElement(
      'div',
      { className: 'd-flex justify-content-center' },
      Teact.createElement(
        'button',
        {
          className: 'btn btn-primary',
          id: 'counter',
          type: 'button',
          onClick: () => setState(c => c + 1),
        },
        `Count: ${state}`,
      ),
    ),
    Teact.createElement(
      'p',
      { className: 'text-muted text-center pt-3' },
      'Click on the Vite logo to learn more',
    ),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
