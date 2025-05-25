import { DefaultButton } from '@/js/components/ui/button'
import { useBanner } from '@/js/hooks/useBanner'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

export const Home = () => {
  const { banners } = useBanner()
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('access_token')

  const bottons = [
    DefaultButton({
      text: 'Play Local',
      onClick: () => navigate('/local/game'),
    }),
    ...(isLoggedIn
      ? [
          DefaultButton({
            text: 'Play Remote',
            onClick: () => navigate('/remote/simple'),
          }),
          DefaultButton({
            text: 'Play Tournament',
            onClick: () => navigate('/remote/tournament'),
          }),
        ]
      : []),
  ]

  return HeaderWithTitleLayout(
    Teact.createElement(
      ...banners,
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        ...bottons,
      ),
    ),
  )
}
