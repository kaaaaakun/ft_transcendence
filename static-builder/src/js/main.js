import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { Home } from '@/js/pages/Home'
import { InputAlias } from '@/js/pages/InputAlias'
import { Pong } from '@/js/pages/Pong'
import { Tournament } from '@/js/pages/Tournament'
import { Login } from '@/js/pages/Login'
import { Logout } from '@/js/pages/Logout'
import { Register } from './pages/Register'
import { passwordReset } from './pages/passwordReset'

function App() {
  return Router(
    Route({ path: '/', component: Home }),
    Route({
      path: '/about',
      component: Teact.createElement('h1', null, 'About'),
    }),
    Route({
      path: '/contact',
      component: Teact.createElement('h1', null, 'Contact'),
    }),
    Route({
      path: '/input_alias',
      component: InputAlias,
    }),
    Route({
      path: '/tournament',
      component: Tournament,
    }),
    Route({
      path: '/game',
      component: Pong,
    }),
    Route ({
      path: '/login',
      component: Login,
    }),
    Route({
      path: '/logout',
      component: Logout,
    }),
    Route({
      path: '/register',
      component: Register,
    }),
    Route({
      path: '/password-reset',
      component: passwordReset,
    }),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
