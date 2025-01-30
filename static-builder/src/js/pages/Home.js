import { DefaultButton } from '@/js/components/ui/button'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { api } from '@/js/infrastructures/api/fetch'

export const Home = () => {
  const navigate = useNavigate()

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: 'Play Now',
          onClick: () =>
            api
              .get('/api/matches/local')
              .then(response => {
                return response.json()
              })
              .then(data => {
                navigate('/local_game', { data })
              })
              .catch(error => {
                console.error('Error:', error)
              }),
        }),
        DefaultButton({
          text: 'Tournament Mode',
          onClick: () =>
            navigate('/select_tournament_type')
        }),
        cookie.checkTournamentIdExists()
          ? DefaultButton({
              text: 'Resume Game',
              onClick: () =>
                tournamentsApi
                  .fetchLocalTournament()
                  .then(data => {
                    navigate('/tournament', { data })
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
