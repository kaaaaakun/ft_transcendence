import { Teact } from '@/js/teact'

export const Header = () => {
  return Teact.createElement(
    'header',
    { className: 'bg-dark text-white p-3' },
    Teact.createElement(
      'div',
      {
        className:
          'container d-flex justify-content-between align-items-center',
      },
      Teact.createElement(
        'a',
        { href: '/', className: 'text-white' },
        Teact.createElement('h1', { className: 'm-0' }, 'My Website'),
      ),
      Teact.createElement(
        'nav',
        null,
        Teact.createElement(
          'ul',
          { className: 'nav' },
          Teact.createElement(
            'li',
            { className: 'nav-item' },
            Teact.createElement(
              'a',
              { className: 'nav-link text-white', href: '/about' },
              'About',
            ),
          ),
          Teact.createElement(
            'li',
            { className: 'nav-item' },
            Teact.createElement(
              'a',
              { className: 'nav-link text-white', href: '/services' },
              'Services',
            ),
          ),
          Teact.createElement(
            'li',
            { className: 'nav-item' },
            Teact.createElement(
              'a',
              { className: 'nav-link text-white', href: '/contact' },
              'Contact',
            ),
          ),
        ),
      ),
    ),
  )
}
