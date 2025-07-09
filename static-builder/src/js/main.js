import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { FriendsList } from '@/js/pages/FriendsList'
import { Home } from '@/js/pages/Home'
import { Login } from '@/js/pages/Login'
import { Register } from '@/js/pages/Register'
import { UserProfile } from '@/js/pages/UserProfile'
import '@/scss/styles.scss'
import { api } from '@/js/infrastructures/api/fetch'
import { DeleteAccount } from '@/js/pages/DeleteAccount'
import { PasswordReset } from '@/js/pages/PasswordReset'
import { SimpleGameLocal } from '@/js/pages/SimpleGameLocal'
import { RemoteSimpleIndex } from '@/js/pages/RemoteSimpleIndex'
import { RemoteGame } from '@/js/pages/RemoteGame'
import { TournamentsBracket } from '@/js/pages/TournamentsBracket'
import { TournamentsDisplayName } from '@/js/pages/TournamentsDisplayName'
import { TournamentWaitBegin } from '@/js/pages/TournamentWaitBegin'
import { RemoteTournamentsIndex } from '@/js/pages/RemoteTournamentsIndex'
import { ProtectedRoute } from '@/js/components/common/ProtectedRoute'

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
      component: ProtectedRoute(RemoteSimpleIndex),
    }),
    Route({
      path: '/remote/matches/:id',
      component: ProtectedRoute(RemoteGame),
    }),
    Route({
      path: '/remote/tournament',
      component: ProtectedRoute(RemoteTournamentsIndex),
    }),
    Route({
      path: '/remote/tournament/:id',
      component: ProtectedRoute(TournamentWaitBegin),
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
      component: ProtectedRoute(UserProfile),
    }),
    Route({
      path: '/users/:id/friends',
      component: ProtectedRoute(FriendsList),
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
      component: ProtectedRoute(DeleteAccount),
    }),
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
