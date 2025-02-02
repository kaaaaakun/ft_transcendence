import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'
import { useBanner } from '../hooks/useBanner'

function handleSubmit(event, showErrorBanner, showInfoBanner) {
    const navigate = useNavigate()
    event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

    const formData = new FormData(event.target)

    // FormDataからJSON形式のデータに変換
    const data = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    console.log('Sign up data:', data)

    userApi
      .register(data)
      .then(data => {
        console.log('Success:', data)
        navigate('/login', { data })
      })
      .catch(error => {
        showErrorBanner({
          message: 'Registration failed',
          onClose: () => {},
        })
      })
  }

  export const Register = () => {
    const {showInfoBanner, showWarningBanner, showErrorBanner, banners} = useBanner()
    return BaseLayout(
      Teact.createElement(
        'div',
        { className: 'container' },
        Teact.createElement(
          'form',
          {
            onSubmit: (event) => handleSubmit(event, showErrorBanner, showInfoBanner),
            className: 'text-center mt-3 d-grid gap-2 col-3 mx-auto',
          },
          ...banners,
          ...Array.from({ length: 1 }, (_, i) => {
            const className = 'form-label mt-2 text-start text-white phont-weight-bold'
            return Teact.createElement(
              'div',
              { className: 'row form-group', key: i },
                Teact.createElement(
                  'label',
                  { htmlFor: 'login_name', className: className },
                  'Login Name'
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
                  'Password'
                ),
                { className: 'col-6' },
                Teact.createElement('input', {
                  type: 'text',
                  id: 'password',
                  className: 'form-control',
                  placeholder: 'Password',
                  name: 'password',
                }),
                Teact.createElement(
                  'label',
                  { htmlFor: 'display_name', className: className },
                  'Display Name'
                ),
                Teact.createElement('input', {
                  type: 'text',
                  id: 'display_name',
                  className: 'form-control',
                  placeholder: 'Display name',
                  name: 'display_name',
                }),
                Teact.createElement(
                  'label',
                  { htmlFor: 'secret_question', className: className },
                  'Secret Question'
                ),
                Teact.createElement('input', {
                  type: 'text',
                  id: 'secret_question',
                  className: 'form-control',
                  placeholder: 'Secret question',
                  name: 'secret_question',
                }),
                Teact.createElement(
                  'label',
                  { htmlFor: 'secret_answer', className: className },
                  'Secret Answer'
                ),
                Teact.createElement('input', {
                  type: 'text',
                  id: 'secret_answer',
                  className: 'form-control',
                  placeholder: 'Answer to the question',
                  name: 'secret_answer',
                }),
            )
          }),
          DefaultButton({ type: 'submit', text: 'submit' }),
          Teact.createElement(
            'div',
            { className: 'mt-3' },
            Teact.createElement(
              'a',
              { href: '/login', className: 'text-white' },
              'Already have an account?'
            )
          ),
        ),
      ),
    )
  }
