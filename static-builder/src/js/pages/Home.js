import { DefaultButton } from '@/js/components/ui/button'
import { useBanner } from '@/js/hooks/useBanner'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

export const Home = () => {
  const { banners } = useBanner()
  const navigate = useNavigate()

  return HeaderWithTitleLayout(
    Teact.createElement(
      ...banners,
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: 'Play Local',
          onClick: () => navigate('/local/game'),
        }),
        DefaultButton({
          text: 'Play Remote',
          onClick: () => navigate('/remote/simple'),
        }),
        DefaultButton({
          text: 'Play Tournament',
          onClick: () => navigate('/remote/tournament'),
        }),
      ),
    ),
  )
}
