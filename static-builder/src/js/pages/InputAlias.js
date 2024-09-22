import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useLocation } from '../libs/router'
import { api } from '@/js/infrastructures/api/fetch'

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
  api.post('/api/tournaments/local/', data)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('Success:', data)
      document.cookie = " tournament_id=" + data.tournament_id + "; path=/";
      navigate('/tournament', { data })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

export const InputAlias = () => {
  const loc = useLocation()
  const num = loc.state?.playerNum ?? 0
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
        ...Array.from({ length: num / 2 }, (_, i) => {
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
