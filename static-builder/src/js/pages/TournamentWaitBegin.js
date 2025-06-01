import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

import { useTournamentDetails } from '@/js/hooks/useTournamentDetails'
import { useTournamentWebSocket } from '@/js/hooks/useTournamentWebSocket'

import { TournamentBracket } from '@/js/components/tournament/TournamentBracket'
import { PlayersList } from '@/js/components/tournament/PlayersList'
import { ConnectionStatus } from '@/js/components/tournament/ConnectionStatus'

export const TournamentWaitBegin = props => {
  const navigate = useNavigate()
  const tournamentId = props.params?.id || '1'

  const { roomName, tournamentType, loading, error } =
    useTournamentDetails(tournamentId)

  const { waitingFor, isReady, members, currentPlayers, connectionStatus } =
    useTournamentWebSocket(roomName, loading)

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

  if (loading) {
    return HeaderWithTitleLayout(
      Teact.createElement(
        'div',
        { className: 'container vh-100' },
        Teact.createElement(
          'div',
          { className: 'text-center' },
          Teact.createElement(
            'div',
            { className: 'spinner-border text-primary', role: 'status' },
            Teact.createElement(
              'span',
              { className: 'visually-hidden' },
              'Loading...',
            ),
          ),
          Teact.createElement(
            'p',
            { className: 'mt-3 text-light' },
            'Loading tournament details...',
          ),
        ),
      ),
    )
  }

  const getMessage = () => {
    console.log('--getMessage--')
    console.log(`waitingFor: ${waitingFor}`)
    console.log(`isReady: ${isReady}`)
    console.log(`connectionStatus: ${connectionStatus}`)

    if (connectionStatus !== 'connected') {
      return 'Connecting to tournament...'
    }
    if (isReady) {
      return 'All players ready! Tournament bracket below:'
    }
    return `Waiting for Players..... (${waitingFor} more to start).`
  }

  const renderContent = () => {
    return Teact.createElement(
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
        getMessage(),
      ),

      connectionStatus === 'connected' &&
        Teact.createElement(PlayersList, {
          members,
          currentPlayers,
          tournamentType,
        }),

      connectionStatus === 'connected' &&
        Teact.createElement(TournamentBracket, {
          participants: members,
          tournamentType,
          title: 'Tournament Preview:',
        }),

      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto mt-4' },
        isReady &&
          Teact.createElement(DefaultButton, {
            text: 'Start Tournament',
            onClick: () => {
              console.log('Starting tournament with members:', members)
            },
          }),
        DefaultButton({
          text: 'Leave Tournament',
          onClick: () => navigate('/remote/simple'),
        }),
      ),
    )
  }

  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      renderContent(),
    ),
  )
}
