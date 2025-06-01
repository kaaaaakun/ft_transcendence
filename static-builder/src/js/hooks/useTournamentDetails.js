import { Teact } from '@/js/libs/teact'
import { api } from '@/js/infrastructures/api/fetch'

export const useTournamentDetails = tournamentId => {
  const [roomName, setRoomName] = Teact.useState(null)
  const [tournamentType, setTournamentType] = Teact.useState(4)
  const [loading, setLoading] = Teact.useState(true)
  const [error, setError] = Teact.useState(null)
  const [tournamentData, setTournamentData] = Teact.useState(null)

  const fetchTournamentDetails = async tournamentId => {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/`)
      if (!response.ok) {
        throw new Error('Failed to fetch tournament details')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch tournament details:', error)
      throw error
    }
  }

  Teact.useEffect(() => {
    const initializeTournament = async () => {
      console.log('Initializing tournament with ID:', tournamentId)
      try {
        setLoading(true)
        setError(null)

        const data = await fetchTournamentDetails(tournamentId)
        console.log('Tournament data:', data)

        // websocket_urlまたはroom_nameを使用
        const roomName = data.websocket_url
        if (!roomName) {
          throw new Error('Room name not found in tournament data')
        }

        setRoomName(roomName)
        setTournamentType(data.tournament_type || 4)
        setTournamentData(data)
      } catch (error) {
        console.error('Failed to initialize tournament:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initializeTournament()
  }, [tournamentId])

  return {
    roomName,
    tournamentType,
    loading,
    error,
    tournamentData,
  }
}
