import { api } from '@/js/infrastructures/api/fetch'

// function fetchLocalTournament() {
//   // TODO statusコードによる処理など
//   return api.get('/api/tournaments/local/').then(response => {
//     if (!response.ok) {
//       return response.json().then(errData => {
//         throw new Error(errData.error || 'Unknown error occurred')
//       })
//     }
//     return response.json()
//   })
// }

function login(data) {
  return api.post('/api/users/login/', data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json().then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      return data
    })
  })
}

function register(data) {
  return api.post('/api/users/register/', data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json().then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      return data
    })
  })
}

function passwordReset(data) {
  return api
    .post(`/api/users/${data.login_name}/password_reset/`, data)
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.error || 'Unknown error occurred')
        })
      }
      return response.json()
    })
}

function getSecretQuestion(data) {
  return api
    .get(`/api/users/${data.login_name}/password_reset/`, data)
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.error || 'Unknown error occurred')
        })
      }
      return response.json()
    })
}

function deleteAccount(data) {
  return api.delete(`/api/users/${data.login_name}/`, data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json()
  })
}

export const userApi = {
  login,
  register,
  passwordReset,
  getSecretQuestion,
  deleteAccount,
}
