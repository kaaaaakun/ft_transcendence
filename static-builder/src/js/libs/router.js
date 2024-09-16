import { Teact } from '@/js/libs/teact'

const routes = []
let setCurrentPath = () => {}

export function Router() {
  const [currentPath, setPath] = Teact.useState(window.location.pathname)
  setCurrentPath = setPath

  const route = routes.find(r => r.path === currentPath)
  if (!route) {
    return Teact.createElement('h1', null, '404 Not Found')
  }

  if (route.component instanceof Function) {
    return Teact.createElement(route.component)
  }
  return route.component
}

export function Route({ path, component }) {
  routes.push({ path, component })
  return null
}

export function Link({ to, className, children }) {
  const handleClick = e => {
    // NOTE: preventDefaultすると関数コンポーネントの差分検出がうまく行ってなくて期待通りの動作をしないので一時的にコメントアウト
    e.preventDefault()
    navigate(to)
  }

  return Teact.createElement(
    'a',
    { href: to, onClick: handleClick, className: className },
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
