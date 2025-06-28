import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { FriendsList } from '@/js/pages/FriendsList'
import { Home } from '@/js/pages/Home'
import { Login } from '@/js/pages/Login'
import { Register } from '@/js/pages/Register'
import { UserProfile } from '@/js/pages/UserProfile'
import { api } from '@/js/infrastructures/api/fetch'
import { DeleteAccount } from '@/js/pages/DeleteAccount'
import { PasswordReset } from '@/js/pages/PasswordReset'
import { SimpleGameLocal } from '@/js/pages/SimpleGameLocal'
import { SimpleGameRemote } from '@/js/pages/SimpleGameRemote'
import { TournamentsBracket } from '@/js/pages/TournamentsBracket'
import { TournamentsDisplayName } from '@/js/pages/TournamentsDisplayName'
import { RemoteTournamentsIndex } from '@/js/pages/RemoteTournamentsIndex'

function App() {
  console.log('App rendered')
  Teact.useEffect(() => {
    console.log('App rendered')
    const intervalId = setInterval(() => {
      console.log('App interval')
      if (localStorage.getItem('access_token')) {
        api.post('/api/users/last_login/')
      }
    }, 10000)

    return () => clearInterval(intervalId) // コンポーネントがアンマウントされたら停止
  }, [])
  return Router(
    Route({
      path: '/',
      component: Home,
    }),
    Route({
      path: '/about',
      component: Teact.createElement('h1', null, 'About'),
    }),
    Route({
      path: '/contact',
      component: Teact.createElement('h1', null, 'Contact'),
    }),
    Route({
      path: '/local/game',
      component: SimpleGameLocal,
    }),
    Route({
      path: '/remote/simple',
      component: SimpleGameRemote,
    }),
    Route({
      path: '/remote/matches/:id',
      component: Home, //遷移先のページは仮置き
    }),
    Route({
      path: '/remote/tournament',
      component: RemoteTournamentsIndex, //遷移先のページは仮置き
    }),
    Route({
      path: '/remote/tournament/:id',
      component: Home, //遷移先のページは仮置き
    }),
    Route({
      path: '/tournaments/display-name',
      component: TournamentsDisplayName,
    }),
    Route({
      path: '/tournaments/bracket',
      component: TournamentsBracket,
    }),
    Route({
      path: '/users/:username',
      component: UserProfile,
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
      component: PasswordReset,
    }),
    Route({
      path: '/delete-account',
      component: DeleteAccount,
    }),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
