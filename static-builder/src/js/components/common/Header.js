import { Link } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import Icon from '/icon.png'

export const Header = () => {
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
        'a',
        { href: '/', className: 'text-white' },
        Teact.createElement('img', {
          src: Icon,
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
            Link({
              to: '/about',
              className: 'nav-link text-white no-pointer-events',
              children: ['About'],
            }),
          ),
          Teact.createElement(
            'li',
            { className: 'nav-item' },
            Link({
              to: '/services',
              className: 'nav-link text-white no-pointer-events',
              children: ['Services'],
            }),
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
        ),
      ),
    ),
  )
}
