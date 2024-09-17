import '@/scss/styles.scss'
import { Route, Router, useLocation } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { Home } from '@/js/pages/Home'
import { InputAlias } from '@/js/pages/InputAlias'
import { Tournament } from '@/js/pages/Tournament'
import { Pong } from '@/js/pages/Pong'

// TODO About ページのrouteを設定したら消す
// const Tournament = () => {
//   const loc = useLocation()

//   Teact.useEffect(() => {
//     console.log(loc)
//   }, [])

//   return Teact.createElement('h1', null, 'tournament')
// }

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
  )
}

const element = Teact.createElement(App)
const container = document.getElementById('app')
Teact.render(element, container)
