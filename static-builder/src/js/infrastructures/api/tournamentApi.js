import { api } from '@/js/infrastructures/api/fetch'

function fetchLocalTournament() {
  // TODO statusコードによる処理など
  return api.get('/api/tournaments/local')
}

function createLocalTournament(data) {
  // TODO statusコードによる処理など
  return api.post('/api/tournaments/local', data)
}

export const tournamentsApi = {
  fetchLocalTournament,
  createLocalTournament,
}