import { Link } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import Icon from '/icon.png'
import { userApi } from '@/js/infrastructures/api/userApi'
import { useNavigate } from '@/js/libs/router'

const handleLogout = () => {
  if (localStorage.getItem('access_token')) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

const displayAuth = () => {
  if (localStorage.getItem('access_token')) {
    return Teact.createElement(
      'li',
      { className: 'nav-item' },
      Teact.createElement(
        'button',
        {
          onClick: () => {
            handleLogout()
            window.location.href = '/'
          },
          className: 'nav-link text-white',
        },
        'Logout',
      ),
    )
  }
  return Teact.createElement(
    'li',
    { className: 'nav-item' },
    Link({
      to: '/login',
      className: 'nav-link text-white',
      children: ['Login'],
    }),
  )
}

const renderAvatarSection = avatar_path => {
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
          src: `${avatar_path}?${new Date().getTime()}`,
          className: 'img-fluid profile-icon',
          alt: 'Avatar',
          width: '10',
          height: '10',
        }),
      ),
    ),
  )
}

const displayRegister = () => {
  if (localStorage.getItem('access_token')) {
    return null
  }
  return Teact.createElement(
    'li',
    { className: 'nav-item' },
    Link({
      to: '/register',
      className: 'nav-link text-white',
      children: ['Signup'],
    }),
  )
}

export const Header = () => {
  const [user, setUser] = Teact.useState(null)
  const navigate = useNavigate()
  Teact.useEffect(() => {
    userApi
      .getCurrentUser()
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || 'Unknown error occurred')
          })
        }
        return response.json()
      })
      .then(data => {
        setUser(data)
      })
      .catch(error => {
        return null
      })
  }, [])
  return Teact.createElement(
    'header',
    { className: 'bg-darkblue text-white p-3 border-bottom border-warning' },
    Teact.createElement(
      'div',
      {
        className:
          'container-fluid d-flex justify-content-between align-items-center',
      },

      Teact.createElement(
        'div',
        { className: 'd-flex align-items-center' },
        Teact.createElement(
          'a',
          { href: '/', className: 'text-white' },
          Teact.createElement('img', {
            src: Icon,
            alt: 'Logo',
            width: '30',
            height: '30',
          }),
        ),
      ),
      Teact.createElement(
        'nav',
        null,
        Teact.createElement(
          'ul',
          { className: 'nav' },
          Teact.createElement(
            'div',
            { className: 'd-flex align-items-center' },
            renderAvatarSection(user?.avatar_path),
            user
              ? Teact.createElement(
                  'li',
                  {
                    className: 'nav-link text-info ms-1',
                  },
                  Teact.createElement(
                    'span',
                    { className: 'nav-item d-flex' },
                    Link({
                      to: `/users/${user.display_name}`,
                      className: 'nav-link text-white p-0 ms-3',
                      children: [user.display_name],
                    }),
                  ),
                )
              : Teact.createElement(
                  'span',
                  { className: 'nav-link text-white no-pointer-events ms-3' },
                  'Hello, guest',
                ),
          ),
          Teact.createElement(
            'li',
            { className: 'nav-item' },
            Link({
              to: '/contact',
              className: 'nav-link text-white no-pointer-events',
              children: ['Contact'],
            }),
          ),
          displayAuth(),
          displayRegister(),
        ),
      ),
    ),
  )
}
