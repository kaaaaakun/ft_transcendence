import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'

function handleSubmit(event) {
  event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target)

  const data = {}
  formData.forEach((value, key) => {
    data[key] = value
  })
}

export function InputAlias(num) {
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
          const className =
            i >= numberOfPlayers / 2
              ? 'form-control mt-2 bg-secondary'
              : 'form-control mt-2'
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

const container = document.getElementById('app')
Teact.render(Teact.createElement(InputAlias(2)), container)
