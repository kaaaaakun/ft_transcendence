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

function joinRemoteTournament(data) {
  return api.post('/api/tournaments/', data).then(async response => {
    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error || 'Unknown error occurred')
    }
    const responseData = await response.json()
    console.log('joinRemoteTournament responseData:', responseData)
    if (!responseData.id) {
      throw new Error('Tournament ID is missing in the response')
    }

    return responseData
  })
}

export const tournamentsApi = {
  fetchLocalTournament,
  createLocalTournament,

  joinRemoteTournament,
}
