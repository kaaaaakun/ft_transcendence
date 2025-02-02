import { DefaultButton } from '@/js/components/ui/button'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

export const SelectTournamentType = () => {
  const navigate = useNavigate()

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'h3',
        { className: 'mb-5 text-center text-light' },
        'How many players will participate in the tournament?',
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: '2人対戦',
          onClick: () =>
            navigate('/input_alias?players=2', {
              playerNum: 2,
            }),
        }), // TBD
        DefaultButton({
          text: '4人対戦',
          onClick: () =>
            navigate('/input_alias?players=4', {
              playerNum: 4,
            }),
        }), // TBD
        DefaultButton({
          text: '8人対戦',
          onClick: () =>
            navigate('/input_alias?players=8', {
              playerNum: 8,
            }),
            })
      ),
    ),
  )
}
