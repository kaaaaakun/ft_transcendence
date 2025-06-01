import { DefaultButton } from '@/js/components/ui/button'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { tournamentsApi } from '../infrastructures/api/tournamentApi'

export const RemoteTournamentsIndex = () => {
  const navigate = useNavigate()

  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container vh-100' },
      Teact.createElement(
        'h3',
        { className: 'mb-5 text-center text-light' },
        'Choose Tournament Mode',
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: 'Join 4P Tournament ',
          onClick: async () => {
            try {
              const response = await tournamentsApi.joinRemoteTournament({
                type: 4,
              })
              const tournamentId = response.id

              navigate(`/remote/tournament/${tournamentId}`)
            } catch (error) {
              console.error('Failed to join tournament:', error.message)
            }
          },
        }),
        DefaultButton({
          text: 'Join 8P Tournament ',
          onClick: async () => {
            try {
              const response = await tournamentsApi.joinRemoteTournament({
                type: 8,
              })
              const tournamentId = response.id

              navigate(`/remote/tournament/${tournamentId}`)
            } catch (error) {
              console.error('Failed to join tournament:', error.message)
            }
          },
        }),
      ),
    ),
  )
}
