import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { Home } from '@/js/pages/Home'

function App() {
  return Router(
    Route({ path: '/', component: Teact.createElement(Home) }),
    Route({
      path: '/about',
      component: Teact.createElement('h1', null, 'About'),
    }),
    Route({
      path: '/contact',
      component: Teact.createElement('h1', null, 'Contact'),
    }),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
