import { Teact } from '@/js/libs/teact'

const routes = []
let setCurrentPath = () => {}

export function Router() {
  const [currentPath, setPath] = Teact.useState(window.location.pathname)
  setCurrentPath = setPath

  const route = routes.find(r => r.path === currentPath)
  console.log(route)
  return route ? route.component : Teact.createElement('h1', null, '404 Not Found')
}

export function Route({ path, component }) {
  routes.push({ path, component })
  return null
}

export function Link({ to, children }) {
  const handleClick = e => {
    e.preventDefault()
    navigate(to)
  }

  return Teact.createElement(
    'a',
    { href: to, onClick: handleClick },
    ...children,
  )
}

export function navigate(to) {
  window.history.pushState({}, '', to)
  setCurrentPath(() => to)
}

window.addEventListener('popstate', () => {
  setCurrentPath(() => window.location.pathname)
})
