import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useLocation } from '../libs/router'

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
  fetch('http://127.0.0.1:4010/api/tournaments/local', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() // レスポンスをJSONとしてパース
    })
    .then(data => {
      console.log('Success:', data) // レスポンスをコンソールに出力
      navigate('/tournament', { data })
    })
    .catch(error => {
      console.error('Error:', error) // エラー処理
    })
}

export const InputAlias = () => {
  const loc = useLocation()
  let num = loc.state?.playerNum ?? 0
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
