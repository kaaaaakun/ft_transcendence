import { DefaultButton } from '@/js/components/ui/button'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

let secretQuestion = null;
function handleSubmit(event) {
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
      .then(data => {
        console.log('Success:', data)
        navigate('/register', { data })
      })
      .catch(error => {
        console.error('Error:', error)
      })
    }
  }




  export const deleteAccount = () => {
    return BaseLayout(
      Teact.createElement(
        'div',
        { className: 'container' },
        Teact.createElement(
          'form',
          {
            onSubmit: handleSubmit,
            className: ' mt-3 d-grid gap-2 col-3 mx-auto',
          },
          Teact.createElement(
            'div',
            { className: '', key: 0 },
            Teact.createElement(
              'div',
              { className: 'col-12' },
              Teact.createElement(
                'label',
                { htmlFor: 'login_name', className: 'form-label mt-2 text-start text-white font-weight-bold' },
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
