import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useSearchParams } from '../libs/router'

function handleSubmit(event) {
  const navigate = useNavigate()
  event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target)

  const data = {}
  const players = []
  formData.forEach((value, _key) => {
    players.push(value)
  })
  data.players = players
  tournamentsApi
    .createLocalTournament(data)
    .then(data => {
      cookie.setTournamentId(data.tournament_id)
      navigate('/tournaments/bracket', { data })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

export const TournamentsDisplayName = () => {
  const params = useSearchParams()
  const numPlayers = params.get('players')
  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      Teact.createElement(
        'form',
        {
          onSubmit: handleSubmit,
          className: 'text-center mt-3 d-grid gap-2 col-3 mx-auto',
        },
        ...Array.from({ length: numPlayers / 2 }, (_, i) => {
          const className = 'form-control mt-2'
          return Teact.createElement(
            'div',
            { className: 'row form-group', key: i },
            Teact.createElement(
              'div',
              { className: 'col-6' },
              Teact.createElement('input', {
                type: 'text',
                className: className,
                placeholder: `Player ${i * 2 + 1}`,
                name: `player${i * 2}`,
              }),
            ),
            Teact.createElement(
              'div',
              { className: 'col-6' },
              Teact.createElement('input', {
                type: 'text',
                className: className,
                placeholder: `Player ${i * 2 + 2}`,
                name: `player${i * 2 + 1}`,
              }),
            ),
          )
        }),
        DefaultButton({ type: 'submit', text: 'submit' }),
      ),
    ),
  )
}
