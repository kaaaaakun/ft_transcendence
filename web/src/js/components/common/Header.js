import { Teact } from '@/js/teact'

export const Header = () => {
  return Teact.createElement(
    'header',
    { className: 'bg-darkblue text-white p-3' },
    Teact.createElement(
      'div',
      {
        className:
          'container-fluid d-flex justify-content-between align-items-center',
      },
      Teact.createElement(
        'a',
        { href: '/', className: 'text-white' },
        Teact.createElement('img', {
          src: '/src/assets/images/icon.png',
          alt: 'Logo',
          width: '30',
          height: '30',
        }),
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
