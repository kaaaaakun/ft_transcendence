import { Teact } from '@/js/libs/teact'
import { Navigate } from './Navigate'

export function withProtection(Component) {
  return function ProtectedComponent(props) {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return Teact.createElement(Navigate, {
        to: '/login',
        state: { from: window.location.pathname },
      })
    }
    return Teact.createElement(Component, props)
  }
}
