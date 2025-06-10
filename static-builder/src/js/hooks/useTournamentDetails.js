import { api } from '@/js/infrastructures/api/fetch'

class TournamentDetails {
  async fetchData(tournamentId, setData) {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/`)

      if (!response.ok) {
        throw new Error('Failed to fetch tournament details')
      }

      const responseData = await response.json()

      const roomName = responseData.websocket_url
      if (!roomName) {
        throw new Error('Room name not found in tournament data')
      }

      console.log('fetchData responseData:', responseData)

      return {
        roomName: responseData.room_name,
        tournamentType: responseData.tournament_type || 4,
        tournamentData: responseData,
        loading: false,
        error: null,
      }
    } catch (error) {
      console.error('Failed to initialize tournament:', error)
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
    }
  }
}
export const tournament = new TournamentDetails()
