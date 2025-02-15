import { DefaultButton } from '@/js/components/ui/button'
import { useBanner } from '@/js/hooks/useBanner'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { api } from '@/js/infrastructures/api/fetch'

export const Home = () => {
  const { showInfoBanner, showWarningBanner, showErrorBanner, banners } = useBanner()
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
          text: 'Play Now',
          onClick: () => navigate('/simple-game/local'),
        }),
        DefaultButton({
          text: 'Tournament Mode',
          onClick: () => navigate('/tournaments'),
        }),
        cookie.checkTournamentIdExists()
          ? DefaultButton({
              text: 'Resume Game',
              onClick: () =>
                tournamentsApi
                  .fetchLocalTournament()
                  .then(data => {
                    navigate('/tournaments/bracket', { data })
                  })
                  .catch(error => {
                    console.error('Error:', error)
                  }),
            })
          : null,
      ),
    ),
  )
}
