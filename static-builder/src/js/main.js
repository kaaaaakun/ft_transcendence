import '@/scss/styles.scss'
import { Route, Router } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { FriendsList } from '@/js/pages/FriendsList'
import { Home } from '@/js/pages/Home'
import { UserProfile } from '@/js/pages/UserProfile'
import { Login } from '@/js/pages/Login'
import { Register } from '@/js/pages/Register'
import '@/scss/styles.scss'
import { TournamentsDisplayName } from '@/js/pages/TournamentsDisplayName'
import { SimpleGameLocal } from '@/js/pages/SimpleGameLocal'
import { TournamentsGame } from '@/js/pages/TournamentsGame'
import { TournamentsIndex } from '@/js/pages/TournamentsIndex'
import { TournamentsBracket } from '@/js/pages/TournamentsBracket'
import { DeleteAccount } from '@/js/pages/DeleteAccount'
import { PasswordReset } from '@/js/pages/PasswordReset'
import { api } from '@/js/infrastructures/api/fetch'

function App() {
  console.log('App rendered');
  Teact.useEffect(() => {
    console.log('App rendered');
    const intervalId = setInterval(() => {
      console.log('App interval');
      api.post('/api/users/last_login/');
    }, 10000);

    return () => clearInterval(intervalId); // コンポーネントがアンマウントされたら停止
  }, []);
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
      path: '/simple-game/local',
      component: SimpleGameLocal,
    }),
    Route({
      path: '/tournaments',
      component: TournamentsIndex,
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
      path: '/tournaments/game',
      component: TournamentsGame,
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
