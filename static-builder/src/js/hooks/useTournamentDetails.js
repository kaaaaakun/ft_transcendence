import { api } from '@/js/infrastructures/api/fetch'

class TournamentDetails {
  async fetchData(tournamentId) {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/`)
      if (!response.ok) throw new Error('Failed to fetch tournament details')
      const responseData = await response.json()
      const roomName = responseData.room_name // ←ここも修正
      if (!roomName) throw new Error('Room name not found in tournament data')
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
