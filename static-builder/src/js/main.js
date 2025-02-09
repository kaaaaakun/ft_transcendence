import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { Home } from '@/js/pages/Home'
import { SelectTournamentType } from '@/js/pages/SelectTournamentType'
import { LocalGame } from '@/js/pages/LocalGame'
import { InputAlias } from '@/js/pages/InputAlias'
import { Pong } from '@/js/pages/Pong'
import { Tournament } from '@/js/pages/Tournament'
import { Login } from '@/js/pages/Login'
import { Register } from './pages/Register'
import { passwordReset } from './pages/passwordReset'
import { deleteAccount } from './pages/deleteAccount'

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
      path: '/select_tournament_type',
      component: SelectTournamentType,
    }),
    Route({
      path: '/local_game',
      component: LocalGame,
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
      path: '/register',
      component: Register,
    }),
    Route({
      path: '/password-reset',
      component: passwordReset,
    }),
    Route({
      path: '/delete-account',
      component: deleteAccount,
    })
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
