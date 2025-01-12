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

function signup(data) {
    return api.post('/api/users/signup/', data).then(response => {
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

// function createLocalTournament(data) {
//   // TODO statusコードによる処理など
//   return api.post('/api/tournaments/local/', data).then(response => {
//     if (!response.ok) {
//       return response.json().then(errData => {
//         throw new Error(errData.error || 'Unknown error occurred')
//       })
//     }
//     return response.json()
//   })
// }




export const userApi = {
  login,
  signup,

}
