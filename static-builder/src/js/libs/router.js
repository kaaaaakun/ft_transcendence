import { Teact } from '@/js/libs/teact'

const routes = []
let setCurrentPath = () => {}
let currentState = {}

// パスのパターンと現在のパスが一致するかを判定する
// パスのパターンは / で区切られた文字列で、: で始まる部分はパラメータとして扱う
function matchPath(pathPattern, currentPath) {
  const patternSegments = pathPattern.split('/').filter(seg => seg !== '')
  const pathSegments = currentPath.split('/').filter(seg => seg !== '')

  if (patternSegments.length !== pathSegments.length) {
    return null
  }

  const params = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1)
      params[paramName] = decodeURIComponent(pathSegment)
    } else if (patternSegment !== pathSegment) {
      return null
    }
  }

  return params
}

export function Router() {
  const [currentPath, setPath] = Teact.useState(window.location.pathname)
  const [state, setState] = Teact.useState(currentState)
  setCurrentPath = (path, state = {}) => {
    setPath(path)
    setState(state)
  }

  const pathWithoutQuery = currentPath.split('?')[0]

  const matchedRoute = routes.find(route => {
    const params = matchPath(route.path, pathWithoutQuery)
    if (params) {
      route.params = params
      return true
    }
    return false
  })

  if (!matchedRoute) {
    return Teact.createElement('h1', null, '404 Not Found')
  }

  if (matchedRoute.component instanceof Function) {
    return Teact.createElement(matchedRoute.component, {
      state: state,
      params: matchedRoute.params,
    })
  }

  return matchedRoute.component
}

export function Route({ path, component }) {
  routes.push({ path, component, params: {} })
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

export function navigate(to, state = {}) {
  window.history.pushState(state, '', to)
  currentState = state
  setCurrentPath(to, state)
}

export function useLocation() {
  return { pathname: window.location.pathname, state: currentState }
}

export function useSearchParams() {
  return new URLSearchParams(window.location.search)
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
