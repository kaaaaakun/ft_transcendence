import { DefaultButton } from '@/js/components/ui/button'
import { useBanner } from '@/js/hooks/useBanner'
import { userApi } from '@/js/infrastructures/api/userApi'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

function handleSubmit(event, showErrorBanner) {
  const navigate = useNavigate()
  event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target)

  // FormDataからJSON形式のデータに変換
  const data = {}
  formData.forEach((value, key) => {
    data[key] = value
  })

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
      showErrorBanner({
        message: 'Invalid login name or password',
        onClose: () => {},
      })
    })
}

export const Login = () => {
  const { showInfoBanner, showWarningBanner, showErrorBanner, banners } =
    useBanner()
  return SimpleHeaderLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      Teact.createElement(
        'form',
        {
          onSubmit: event => handleSubmit(event, showErrorBanner),
          className: 'text-center mt-3 d-grid gap-2 col-3 mx-auto',
        },
        ...banners,
        ...Array.from({ length: 1 }, (_, i) => {
          const className =
            'form-label mt-2 text-start text-white phont-weight-bold'
          return Teact.createElement(
            'div',
            { className: 'row form-group', key: i },

            Teact.createElement(
              'label',
              { htmlFor: 'login_name', className: className },
              'Login Name',
            ),
            Teact.createElement('input', {
              type: 'text',
              id: 'login_name',
              className: 'form-control',
              placeholder: 'Login name',
              name: 'login_name',
            }),
            Teact.createElement(
              'label',
              { htmlFor: 'password', className: className },
              'Password',
            ),
            Teact.createElement('input', {
              type: 'password',
              id: 'password',
              className: 'form-control',
              placeholder: 'Password',
              name: 'password',
            }),
          )
        }),
        DefaultButton({ type: 'submit', text: 'submit' }),
        Teact.createElement(
          'div',
          { className: 'mt-3' },
          Teact.createElement(
            'a',
            { href: '/password-reset', className: 'text-white' },
            'Forgot password?',
          ),
        ),
      ),
    ),
  )
}
