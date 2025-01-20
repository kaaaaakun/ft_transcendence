import { DefaultButton } from '@/js/components/ui/button'
import { cookie } from '@/js/infrastructures/cookie/cookie'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

let secret_question = null;
function handleSubmit(event) {
    const navigate = useNavigate()
    event.preventDefault() // フォームのデフォルトの送信を防ぐ（ページリロード防止）

    const formData = new FormData(event.target)

    // FormDataからJSON形式のデータに変換
    const data = {}
    formData.forEach((value, key) => {
      data[key] = value
    })
    console.log(data)
    if (data.login_name && data.secret_answer && data.new_password) {
      userApi
      .passwordReset(data)
      .then(data => {
        console.log('Success:', data)
        navigate('/login', { data })
      })
      .catch(error => {
        console.error('Error:', error)
      })
    } else {
      userApi
      .getsecretQuestion(data)
      .then(data => {
        console.log('Success:', data)
        secret_question = data.secret_question
        navigate( '/password-reset' , { data })
      })
      .catch(error => {
        console.error('Error:', error)
      })
    }

  }


function displaySecretQuestion() {
    if (secret_question) {
      return Teact.createElement(
          'p',
          {
            className: 'mt-4 text-white bg-danger text-center font-weight-bold p-3 rounded'
          },
          `秘密の質問: ${secret_question}`
        )
    }
  }

function resetPasswordInfo() {
    if (secret_question) {
    return Teact.createElement(
        'div',
        { className: '' },
        Teact.createElement(
          'label',
          { htmlFor: 'secret_answer', className: 'form-label mt-2 text-start text-white font-weight-bold' },
          'Secret Answer',
        ),
        Teact.createElement('input', {
          type: 'text',
          id: 'secret_answer',
          className: 'form-control',
          placeholder: 'Your answer',
          name: 'secret_answer',
        }),
        Teact.createElement(
          'label',
          { htmlFor: 'new_password', className: 'form-label mt-2 text-start text-white font-weight-bold' },
          'New Password',
        ),
        Teact.createElement('input', {
          type: 'text',
          id: 'new_password',
          className: 'form-control',
          placeholder: 'New password',
          name: 'new_password',
        }),
    )
  }
}


  export const passwordReset = () => {
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
            displaySecretQuestion(),
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
            resetPasswordInfo(),
          ),
          DefaultButton({ type: 'submit', text: 'submit' }),
        ),
      ),
    )
  }
