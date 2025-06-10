import { Teact } from '@/js/libs/teact'
export const useTournamentWebSocket = (roomName, loading) => {
  const [waitingFor, setWaitingFor] = Teact.useState(4)
  const [isReady, setIsReady] = Teact.useState(false)
  const [members, setMembers] = Teact.useState([])
  const [currentPlayers, setCurrentPlayers] = Teact.useState(0)
  const [connectionStatus, setConnectionStatus] = Teact.useState('disconnected')
  const [isInitialized, setIsInitialized] = Teact.useState(false) // 初期化フラグ

  Teact.useEffect(() => {
    if (loading === null) {
      return
    }
    if (!roomName || loading) {
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('No access token found')
      setConnectionStatus('error')
      setIsInitialized(true)
      return
    }

    setConnectionStatus('connecting')
    setIsInitialized(true)

    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_URL ?? 'wss://localhost'
    const ws = new WebSocket(`${baseWsUrl}/api/ws/${roomName}/?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connected to room:', roomName)
      setConnectionStatus('connected')
    }

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)

        if (data.status === 'waiting') {
          setWaitingFor(data.waiting_for || 4)
          setCurrentPlayers(data.entry_count || 0)
          setMembers(data.members || [])
          setIsReady(false)
        } else if (data.status === 'room_ready') {
          setWaitingFor(0)
          setCurrentPlayers(data.entry_count || 4)
          setMembers(data.members || [])
          setIsReady(true)
        }
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
      setConnectionStatus('error')
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected from room:', roomName)
      setConnectionStatus('disconnected')
    }

    return () => {
      // if (ws.readyState === WebSocket.OPEN) {
      //   ws.close()
      // }
    }
  }, [roomName, loading])

  return {
    waitingFor,
    isReady,
    members,
    currentPlayers,
    connectionStatus,
    isInitialized,
  }
}
