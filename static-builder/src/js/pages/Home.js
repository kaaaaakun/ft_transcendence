import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'

export const Home = () => {
  const navigate = useNavigate()

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'h3',
        { className: 'mb-5 text-center text-light' },
        '遊ぶモードを選んでください',
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: '2人対戦',
          onClick: () =>
            navigate('/input_alias', {
              playerNum: 2,
            }),
        }), // TBD
        DefaultButton({
          text: '4人対戦',
          onClick: () =>
            navigate('/input_alias', {
              playerNum: 4,
            }),
        }), // TBD
        DefaultButton({
          text: '8人対戦',
          onClick: () =>
            navigate('/input_alias', {
              playerNum: 8,
            }),
        }), // TBD
        cookie.checkTournamentIdExists()
          ? DefaultButton({
              text: '続きから',
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
