import { Teact } from '@/js/libs/teact'

function getBackgroundColorFromInitial(initial) {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-success',
    'bg-danger',
    'bg-warning',
    'bg-info',
    'bg-dark',
  ]
  const charCode = initial?.toUpperCase().charCodeAt(0) || 0
  const index = charCode % colors.length
  return colors[index]
}

export const avatarSection = (user, extraClassName) => {
  const avatarPath = user.avatar_path
  if (!avatarPath) {
    const initial = user.display_name?.charAt(0).toUpperCase() || '?'
    const bgClass = getBackgroundColorFromInitial(initial)
    return Teact.createElement(
        'div',
        { className: `${bgClass} ${extraClassName} img-fluid text-center d-flex align-items-center justify-content-center` },
        initial
      )
  }
  return Teact.createElement(
    'div',
    { className: 'text-center' },
    Teact.createElement(
      'div',
      { className: '' },
      Teact.createElement(
        'label',
        null,
        Teact.createElement('img', {
          src: `${avatarPath}?${new Date().getTime()}`,
          className: `${extraClassName} img-fluid`,
          alt: 'Avatar',
        }),
      ),
    ),
  )
}
