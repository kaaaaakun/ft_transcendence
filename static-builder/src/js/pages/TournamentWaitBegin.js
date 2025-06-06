import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

import { tournament } from '@/js/hooks/useTournamentDetails'
import { ConnectionStatus } from '@/js/components/tournament/ConnectionStatus'

export const TournamentWaitBegin = props => {
  const navigate = useNavigate()
  const tournamentId = props.params?.id || '1'

  const [roomName, setRoomName] = Teact.useState(null)
  const [tournamentType, setTornamentType] = Teact.useState(4) // デフォルトのトーナメントタイプ
  const [loading, setLoading] = Teact.useState(true)
  const [error, setError] = Teact.useState(null)
  const [waitingFor, setWaitingFor] = Teact.useState(4)
  const [isReady, setIsReady] = Teact.useState(false)
  const [members, setMembers] = Teact.useState([])
  const [currentPlayers, setCurrentPlayers] = Teact.useState(0)
  const [connectionStatus, setConnectionStatus] = Teact.useState('disconnected')
  const [isInitialized, setIsInitialized] = Teact.useState(false) // 初期化フラグ

  Teact.useEffect(() => {
    console.log('TournamentWaitBegin useEffect called', { tournamentId })

    const fetchTournamentDetails = async () => {
      try {
        const data = await tournament.fetchData(tournamentId)

        console.log('Fetched tournament data:', data)
        setRoomName(data.roomName)
        setTornamentType(data.tournamentType)
        setLoading(data.loading)
        setError(data.error)
      } catch (error) {
        console.error('Error fetching tournament details:', error)
      }
    }

    fetchTournamentDetails()
  }, [])

  Teact.useEffect(() => {
    console.log('waitingFor useEffect called', { waitingFor })
  }, [waitingFor])
  Teact.useEffect(() => {
    console.log('roomName useEffect called', { roomName })
  }, [roomName])

  console.log(
    `  useTournamentDetails: roomName=${roomName}, tournamentType=${tournamentType}, loading=${loading}, error=${error}`,
  )

  Teact.useEffect(() => {
    console.log('    useEffect called', { roomName, loading })

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
      setIsInitialized(true) // エラーでも初期化完了
      return
    }

    setConnectionStatus('connecting')
    setIsInitialized(true) // 接続開始で初期化完了

    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_URL ?? 'wss://localhost'
    const ws = new WebSocket(`${baseWsUrl}/api/ws/${roomName}/?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connected to room:', roomName)
      setConnectionStatus('connected')
    }

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received WebSocket message:', data)

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
        } else {
          console.warn('Unknown message status:', data.status)
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
  }, [roomName, loading]) // 依存配列を追加

  if (error) {
    return HeaderWithTitleLayout(
      Teact.createElement(
        'div',
        { className: 'container vh-100' },
        Teact.createElement(
          'div',
          { className: 'alert alert-danger text-center' },
          `Error: ${error}`,
        ),
        Teact.createElement(
          'div',
          { className: 'd-grid gap-2 col-3 mx-auto mt-4' },
          DefaultButton({
            text: 'Back to Tournament Selection',
            onClick: () => navigate('/remote/simple'),
          }),
        ),
      ),
    )
  }

  const getMessage = () => {
    if (connectionStatus !== 'connected') {
      return Teact.createElement('span', null, 'Connecting to tournament...')
    }
    if (isReady) {
      return Teact.createElement(
        'span',
        null,
        'All players ready! Tournament bracket below:',
      )
    }
    return Teact.createElement(
      'span',
      null,
      `Waiting for Players..... (${waitingFor} more to start).`,
    )
  }

  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'div',
        { className: 'text-center' },

        Teact.createElement(
          'h2',
          { className: 'mb-4 text-light' },
          `Tournament Lobby (ID: ${tournamentId})`,
        ),

        Teact.createElement(ConnectionStatus, {
          connectionStatus,
          roomName,
        }),

        Teact.createElement(
          'p',
          {
            className: `mt-4 ${isReady ? 'text-white bg-success' : 'text-dark bg-light'} text-center font-weight-bold p-3 rounded`,
          },
          waitingFor,
        ),
      ),
    ),
  )
}
