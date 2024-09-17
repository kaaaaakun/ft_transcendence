import { Teact } from '@/js/libs/teact'

const routes = []
let setCurrentPath = () => {
  return
}
let currentState = {}

export function Router() {
  const [currentPath, setPath] = Teact.useState(window.location.pathname)
  const [state, setState] = Teact.useState(currentState)
  setCurrentPath = (path, state = {}) => {
    setPath(() => path)
    setState(() => state)
  }

  const route = routes.find(r => r.path === currentPath)
  if (!route) {
    return Teact.createElement('h1', null, '404 Not Found')
  }

  if (route.component instanceof Function) {
    return Teact.createElement(route.component, { state })
  }

  return route.component
}

export function Route({ path, component }) {
  routes.push({ path, component })
  return null
}

export function Link({ to, className, children, state }) {
  const handleClick = e => {
    e.preventDefault()
    navigate(to, state)
  }

  return Teact.createElement(
    'a',
    { href: to, onClick: handleClick, className: className },
    ...children,
  )
}

function navigate(to, state = {}) {
  window.history.pushState(state, '', to)
  currentState = state
  setCurrentPath(to, state)
}

export function useLocation() {
  return { pathname: window.location.pathname, state: currentState }
}

export function useNavigate() {
  return (to, state = {}) => {
    navigate(to, state)
  }
}

window.addEventListener('popstate', event => {
  currentState = event.state || {}
  setCurrentPath(window.location.pathname, currentState)
})
