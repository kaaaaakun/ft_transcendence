import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Navigate, useNavigate, useSearchParams } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

function handleSubmit(event) {
  const navigate = useNavigate()
  event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target)

  const data = {}
  const players = []
  formData.forEach((value, key) => {
    players.push(value)
  })
  data.players = players
  tournamentsApi
    .createLocalTournament(data)
    .then(data => {
      console.log('Success:', data)
      cookie.setTournamentId(data.tournament_id)
      navigate('/tournament', { data })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

const availablePlayers = [2, 4, 8]

export const InputAlias = () => {
  const params = useSearchParams()
  const numPlayers = params.get('players')

  if (!availablePlayers.includes(Number(numPlayers))) {
    return Navigate({ to: '/input_alias?players=2' })
  }

  return BaseLayout(
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
