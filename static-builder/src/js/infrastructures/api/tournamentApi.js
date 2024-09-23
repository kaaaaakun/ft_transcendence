import { api } from '@/js/infrastructures/api/fetch'

function fetchLocalTournament() {
  // TODO statusコードによる処理など
  return api.get('/api/tournaments/local/').then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json()
  })
}

function createLocalTournament(data) {
  // TODO statusコードによる処理など
  return api.post('/api/tournaments/local/', data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json()
  })
}

export const tournamentsApi = {
  fetchLocalTournament,
  createLocalTournament,
}
