import { DefaultButton } from '@/js/components/ui/button'
import { api } from '@/js/infrastructures/api/fetch'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'
import { useBanner } from '@/js/hooks/useBanner'

const waitingRoomLimit = 5

export function SimpleGameRemote() {
  const [rooms, setRooms] = Teact.useState([])
  const [loading, setLoading] = Teact.useState(true)
  const [error, setError] = Teact.useState(null)
  const navigate = useNavigate()
  const { banners, showErrorBanner } = useBanner()

  Teact.useEffect(() => {
    api
      .get('/api/simple-matches/?type=remote')
      .then(response => response.json())
      .then(data => {
        setRooms(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load rooms. Please try again later.')
        setLoading(false)
      })
  }, [])

  /* biome-disable lint/style/useNamingConvention */
  const handleJoin = async match => {
    try {
      /* biome-ignore lint/style/useNamingConvention: API responseのjson dataと合わせる必要があるため */
      const response = await api.post('/api/simple-matches/join/', {
        match_id: match.match_id,
      })
      if (response.status === 201) {
        const data = await response.json()
        navigate(`/remote/matches/${data.match_id}`)
      } else {
        const errorData = await response.json()
        showErrorBanner({
          message:
            errorData.error ||
            'Failed to join the room. Please try again later.',
          onclose: () => {},
        })
      }
    } catch (err) {
      let errorMsg =
        'An error occurred while joining the room. Please try again later.'
      if (err.response && typeof err.response.json === 'function') {
        try {
          const errorData = await err.response.json()
          if (errorData?.error) {
            errorMsg = errorData.error
          }
        } catch {}
      }
      showErrorBanner({
        message: errorMsg,
        onclose: () => {},
      })
    }
  }
  /* biome-enable lint/style/useNamingConvention */

  const handleCreate = async () => {
    try {
      const response = await api.post('/api/simple-matches/create/', {
        type: 'remote',
      })
      if (response.status === 201) {
        const data = await response.json()
        navigate(`/remote/matches/${data.match_id}`)
      } else {
        showErrorBanner({
          message: 'Failed to create a room. Please try again later.',
          onclose: () => {},
        })
      }
    } catch (_err) {
      showErrorBanner({
        message:
          'An error occurred while creating your room. Please try again later.',
        onclose: () => {},
      })
    }
  }

  const roomListChildren = [
    rooms.length === 0
      ? Teact.createElement('div', null, 'No waiting rooms available now')
      : null,
    rooms.length < waitingRoomLimit
      ? Teact.createElement(
          'div',
          { style: { marginBottom: '1em' } },
          DefaultButton({
            onClick: handleCreate,
            text: 'Make my room',
          }),
        )
      : null,
    ...rooms
      .map(match =>
        match
          ? Teact.createElement(
              'div',
              { key: match.match_id, className: 'room-item' },
              DefaultButton({
                onClick: () => handleJoin(match),
                text: match.display_name,
              }),
            )
          : null,
      )
      .filter(Boolean),
  ].filter(Boolean)

  return SimpleHeaderLayout(
    ...(banners || []).filter(Boolean),
    Teact.createElement(
      'div',
      {
        className:
          'container d-flex justify-content-center align-items-center flex-column min-vh-100',
      },
      Teact.createElement('h1', { className: 'text-center' }, 'Waiting Rooms'),
      Teact.createElement(
        'p',
        { className: 'text-center' },
        'Please select a room to join.',
      ),
      loading
        ? Teact.createElement('div', { className: 'text-center' }, 'Loading...')
        : null,
      error
        ? Teact.createElement('div', { className: 'error text-center' }, error)
        : null,
      loading || error
        ? null
        : Teact.createElement(
            'div',
            { className: 'room-list d-flex flex-column align-items-center' },
            ...roomListChildren,
          ),
    ),
  )
}
