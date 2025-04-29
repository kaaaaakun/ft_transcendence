import { DefaultButton } from '@/js/components/ui/button'
import { useBanner } from '@/js/hooks/useBanner'
import { userApi } from '@/js/infrastructures/api/userApi'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

const secretQuestion = null
function handleSubmit(event, showErrorBanner) {
  const navigate = useNavigate()
  event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target)

  // FormDataからJSON形式のデータに変換
  const data = {}
  formData.forEach((value, key) => {
    data[key] = value
  })
  if (data.login_name) {
    userApi
      .deleteAccount(data)
      .then(response => {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          throw new Error('Unauthorized')
        }
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || 'Unknown error occurred')
          })
        }
        return response.json()
      })
      .then(data => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate('/register', { data })
      })
      .catch(error => {
        showErrorBanner({
          message: 'Failed to delete account',
          onClose: () => {},
        })
      })
  }
}

export const DeleteAccount = () => {
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
          className: ' mt-3 d-grid gap-2 col-3 mx-auto',
        },
        ...banners,
        Teact.createElement(
          'div',
          { className: '', key: 0 },
          Teact.createElement(
            'div',
            { className: 'col-12' },
            Teact.createElement(
              'label',
              {
                htmlFor: 'login_name',
                className:
                  'form-label mt-2 text-start text-white font-weight-bold',
              },
              'Login Name',
            ),
            Teact.createElement('input', {
              type: 'text',
              id: 'login_name',
              className: 'form-control',
              placeholder: 'Login name',
              name: 'login_name',
            }),
          ),
        ),
        DefaultButton({ type: 'submit', text: 'Detele Your Account' }),
      ),
    ),
  )
}
