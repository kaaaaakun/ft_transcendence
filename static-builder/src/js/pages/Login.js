import { DefaultButton } from '@/js/components/ui/button'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

function handleSubmit(event) {
    const navigate = useNavigate()
    event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

    const formData = new FormData(event.target)

    // FormDataからJSON形式のデータに変換
    const data = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    console.log('Login data:', data)

    userApi
      .login(data)
      .then(data => {
        console.log('Success:', data)
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
        }
        navigate('/', { data })
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }

  export const Login = () => {
    const numPlayers = 2
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
                  placeholder: `Login name`,
                  name: `login_name`,
                }),
              ),
              Teact.createElement(
                'div',
                { className: 'col-6' },
                Teact.createElement('input', {
                  type: 'text',
                  className: className,
                  placeholder: `Password`,
                  name: `password`,
                }),
              ),
            )
          }),
          DefaultButton({ type: 'submit', text: 'submit' }),
        ),
      ),
    )
  }
