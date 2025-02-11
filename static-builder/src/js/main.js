import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { FriendsList } from '@/js/pages/FriendsList'
import { Home } from '@/js/pages/Home'
import { InputAlias } from '@/js/pages/InputAlias'
import { LocalGame } from '@/js/pages/LocalGame'
import { Login } from '@/js/pages/Login'
import { Pong } from '@/js/pages/Pong'
import { Register } from '@/js/pages/Register'
import { SelectTournamentType } from '@/js/pages/SelectTournamentType'
import { Tournament } from '@/js/pages/Tournament'
import { deleteAccount } from '@/js/pages/deleteAccount'
import { passwordReset } from '@/js/pages/passwordReset'

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
    Route({
      path: '/users/:id/friends',
      component: FriendsList,
    }),
    Route({
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
    }),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
