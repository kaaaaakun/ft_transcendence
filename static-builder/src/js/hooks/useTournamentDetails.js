import { api } from '@/js/infrastructures/api/fetch'

class TournamentDetails {
  async fetchData(tournamentId) {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied (403)')
        }
        if (response.status === 404) {
          throw new Error('Tournament not found (404)')
        }

        throw new Error(`An unknown error occurred (${response.status})`)
      }
      const responseData = await response.json()
      const roomName = responseData.room_name
      if (!roomName) {
        throw new Error('Room name not found in tournament data')
      }
      return {
        roomName,
        tournamentType: responseData.tournament_type || 4,
        tournamentData: responseData,
        loading: false,
        error: null,
      }
    } catch (error) {
      return {
        roomName: null,
        tournamentType: 4,
        tournamentData: null,
        loading: false,
        error: error.message,
      }
    }
  }
}
export const tournament = new TournamentDetails()
