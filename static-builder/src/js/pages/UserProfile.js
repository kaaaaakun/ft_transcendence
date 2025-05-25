import '@/scss/styles.scss'
import { useBanner } from '@/js/hooks/useBanner'
import { userApi } from '@/js/infrastructures/api/userApi'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { Avatar } from '@/js/components/common/Avatar'

export const UserProfile = props => {
  const { showInfoBanner, showErrorBanner, banners } = useBanner()
  const [isEditing, setIsEditing] = Teact.useState(false)
  const [userData, setUserData] = Teact.useState(null)
  let changeUserName = ''
  const onAccept = friendId => {
    userApi
      .acceptFriendRequest(friendId)
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showErrorBanner({
              message: 'Failed to accept request: Unauthorized',
              onClose: () => {},
            })
          } else {
            throw new Error('Failed to accept request')
          }
        }
      })
      .then(_data => {
        showInfoBanner({
          message: 'Successfully updated',
          onClose: () => {},
        })
        setUserData(prevUserData => ({
          ...prevUserData,
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          relation_to_current_user: 'friend',
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          num_of_friends: prevUserData.num_of_friends + 1,
        }))
      })
  }

  const onRequest = friendId => {
    userApi
      .friendRequest(friendId)
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showErrorBanner({
              message: 'Failed to send request: Unauthorized',
              onClose: () => {},
            })
          } else {
            throw new Error('Failed to send friend request')
          }
        }
      })
      .then(_data => {
        showInfoBanner({
          message: 'Successfully updated',
          onClose: () => {},
        })
        setUserData(prevUserData => ({
          ...prevUserData,
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          relation_to_current_user: 'requesting',
        }))
      })
  }

  const onReject = friendId => {
    userApi
      .rejectFriendRequest(friendId)
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showErrorBanner({
              message: 'Failed to reject request: Unauthorized',
              onClose: () => {},
            })
          } else {
            throw new Error('Failed to reject request')
          }
        }
      })
      .then(_data => {
        showInfoBanner({
          message: 'Successfully updated',
          onClose: () => {},
        })
        setUserData(prevUserData => ({
          ...prevUserData,
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          relation_to_current_user: 'stranger',
        }))
      })
  }

  const onDelete = friendId => {
    userApi
      .deleteFriend(friendId)
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showErrorBanner({
              message: 'Failed to reject request: Unauthorized',
              onClose: () => {},
            })
          } else {
            throw new Error('Failed to reject request')
          }
        }
      })
      .then(_data => {
        showInfoBanner({
          message: 'Successfully updated',
          onClose: () => {},
        })
        setUserData(prevUserData => ({
          ...prevUserData,
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          relation_to_current_user: 'stranger',
          /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
          num_of_friends: prevUserData.num_of_friends - 1,
        }))
      })
  }

  const handleAvatarChange = async event => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('avatar_path', event.target.files[0])
    try {
      const response = await userApi.changeProfile(formData)
      if (!response.ok) {
        if (response.status === 413) {
          showErrorBanner({
            message: 'Failed to upload avatar: File size too large',
            onClose: () => {},
          })
        } else if (response.status === 401) {
          showErrorBanner({
            message: 'Failed to upload avatar: Unauthorized',
            onClose: () => {},
          })
        } else {
          throw new Error('Failed to upload avatar')
        }
      }
      const data = await response.json()
      setUserData(prevUserData => ({
        ...prevUserData,
        /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
        avatar_path: data.avatar_url,
      }))
    } catch (error) {
      console.error('Upload error:', error)
      showErrorBanner({
        message: 'An unexpected error occurred while uploading avatar.',
        onClose: () => {},
      })
    }
  }

  const handleSave = async () => {
    if (!changeUserName) {
      return
    }
    try {
      const response = await userApi.changeProfile({
        /* biome-ignore lint/style/useNamingConvention: APIが期待するjsonのkeyをそのまま使用しているため */
        display_name: changeUserName,
      })
      if (!response.ok) {
        if (response.status === 401) {
          showErrorBanner({
            message: 'Failed to save: Unauthorized',
            onClose: () => {},
          })
        } else if (response.status === 400) {
          const data = await response.json()
          showErrorBanner({
            message: data.errors[0].message,
            onClose: () => {},
          })
          return
        } else {
          throw new Error('Failed to save')
        }
        return
      }
      const data = await response.json()
      setUserData(prevUserData => ({
        ...prevUserData,
        /* biome-ignore lint/style/useNamingConvention: API responseのjson dataをそのまま使用しているため */
        display_name: data.display_name,
      }))
      setIsEditing(false)
      changeUserName = ''
    } catch (error) {
      console.error('Save error:', error)
      showErrorBanner({
        message: 'An unexpected error occurred while saving.',
        onClose: () => {},
      })
    }
  }

  const renderAvatarSection = () => {
    return Teact.createElement(
      'div',
      { className: 'text-center' },
      Teact.createElement(
        'div',
        { className: 'relative w-32 h-32' },
        Teact.createElement(
          'label',
          null,
          Avatar(userData, 'profile-icon'),
          'login_name' in userData
            ? Teact.createElement('input', {
                type: 'file',
                accept: 'image/*',
                className: 'hidden',
                onChange: handleAvatarChange,
              })
            : null,
        ),
      ),
      userData.display_name
        ? Teact.createElement(
            'a',
            {
              href: `/users/${userData.display_name}/friends`,
              className: 'text-blue-500 hover:underline',
            },
            `Friends: ${userData.num_of_friends}`,
          )
        : Teact.createElement('p', null, `Friends: ${userData.num_of_friends}`),
    )
  }

  const renderProfileSection = () => {
    return Teact.createElement(
      'div',
      { className: 'ps-3' },
      Teact.createElement(
        'div',
        { className: 'd-flex align-items-center' },
        Teact.createElement(
          'div',
          null,
          isEditing && 'login_name' in userData
            ? Teact.createElement('input', {
                type: 'text',
                className: 'form-control',
                value: userData.display_name,
                onChange: e => {
                  changeUserName = e.target.value
                },
              })
            : Teact.createElement(
                'h1',
                { className: 'text-spacing m-auto' },
                userData.display_name,
              ),
        ),
        Teact.createElement(
          'div',
          null,
          isEditing && 'login_name' in userData
            ? Teact.createElement(
                'div',
                { className: 'd-flex justify-content-center' },
                Teact.createElement(
                  'button',
                  {
                    className: 'btn btn-success btn-sm align-items-center ms-2',
                    onClick: handleSave,
                  },
                  'Save',
                ),
                Teact.createElement(
                  'button',
                  {
                    className:
                      'btn btn-outline-secondary btn-sm align-items-center ms-2',
                    onClick: () => {
                      setIsEditing(false)
                      changeUserName = ''
                    },
                  },
                  'Cancel',
                ),
              )
            : 'login_name' in userData
              ? Teact.createElement(
                  'button',
                  {
                    className:
                      'btn btn-outline-primary btn-sm align-items-center text-center',
                    onClick: () => setIsEditing(true),
                  },
                  'Edit',
                )
              : null,
        ),
      ),
      'login_name' in userData
        ? Teact.createElement(
            'div',
            null,
            Teact.createElement(
              'p',
              { className: 'fs-5 text-spacing m-auto' },
              `${userData.login_name}`,
            ),
          )
        : null,
    )
  }

  const renderGameRecord = record => {
    return Teact.createElement(
      'tr',
      { className: 'text-center' },
      Teact.createElement(
        'td',
        { className: 'width-35 border-end' },
        `${userData.display_name} vs ${record.opponent_name}`,
      ),
      Teact.createElement(
        'td',
        { className: 'width-10 border-end' },
        record.result,
      ),
      Teact.createElement(
        'td',
        { className: 'width-15 border-end' },
        `${record.score.player} - ${record.score.opponent}`,
      ),
      Teact.createElement('td', { className: 'width-15' }, record.match_type),
    )
  }

  Teact.useEffect(() => {
    const userName = props.params.username
    userApi
      .getProfile(userName)
      .then(response => {
        if (response.status === 404) {
          showErrorBanner({
            message: 'User not found',
            onClose: () => {},
          })
          return
        }
        if (response.status === 401) {
          showErrorBanner({
            message: 'Unauthorized',
            onClose: () => {},
          })
          return
        }
        if (response.status === 200) {
          return response.json()
        }
        throw new Error('Unknown error occurred')
      })
      .then(data => {
        if (data) {
          setUserData(data)
        }
      })
      .catch(error =>
        showErrorBanner({
          message: error.message,
          onClose: () => {},
        }),
      )
  }, [props.params.username])

  if (!userData) {
    return HeaderWithTitleLayout(
      ...banners,
      Teact.createElement('p', null, 'Loading...'),
    )
  }

  const friendButton = () => {
    const relation = userData.relation_to_current_user
    if (relation === 'self') {
      return null
    }
    if (relation === 'friend') {
      return Teact.createElement(
        'button',
        {
          className: 'btn btn-danger btn-sm ms-3',
          onClick: () => onDelete(userData.display_name),
        },
        'Unfriend',
      )
    }
    if (relation === 'requesting') {
      return Teact.createElement(
        'button',
        {
          className: 'btn btn-info btn-sm ms-3',
          onClick: () => onReject(userData.display_name),
        },
        'Cancel Request Friend',
      )
    }
    if (relation === 'request_received') {
      return Teact.createElement(
        'div',
        null,
        Teact.createElement(
          'button',
          {
            className: 'btn btn-success btn-sm ms-3',
            onClick: () => onAccept(userData.display_name),
          },
          'Accept Request',
        ),
        Teact.createElement(
          'button',
          {
            className: 'btn btn-danger btn-sm ms-3',
            onClick: () => onReject(userData.display_name),
          },
          'Reject Request',
        ),
      )
    }
    if (relation === 'stranger') {
      console.log('userData', userData)
      return Teact.createElement(
        'button',
        {
          className: 'btn btn-primary btn-sm ms-3',
          onClick: () => onRequest(userData.display_name),
        },
        'Request Friend',
      )
    }
    return null
  }

  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white' },
      ...banners,
      Teact.createElement(
        'div',
        { className: 'container bg-white pb-3 pt-3' },
        Teact.createElement(
          'div',
          { className: 'd-flex align-items-center' },
          renderAvatarSection(),
          renderProfileSection(),
          friendButton(),
        ),
        Teact.createElement(
          'div',
          { className: 'container mt-3' },
          Teact.createElement(
            'h2',
            { className: 'text-secondary fs-6' },
            'Game Records',
          ),
          Teact.createElement(
            'div',
            { className: 'table-header' },
            Teact.createElement(
              'table',
              { className: 'table table-bordered table-striped mt-2' },
              Teact.createElement(
                'thead',
                null,
                Teact.createElement(
                  'tr',
                  { className: 'text-center' },
                  Teact.createElement(
                    'th',
                    { className: 'width-35 border-end' },
                    'Match',
                  ),
                  Teact.createElement(
                    'th',
                    { className: 'width-10 border-end' },
                    'Result',
                  ),
                  Teact.createElement(
                    'th',
                    { className: 'width-15 border-end' },
                    'Score',
                  ),
                  Teact.createElement(
                    'th',
                    { className: 'width-15' },
                    'Match Type',
                  ),
                ),
              ),
              Teact.createElement(
                'tbody',
                { className: 'table-body-scroll' },
                ...(userData?.performance?.game_records?.map(record =>
                  renderGameRecord(record),
                ) || []),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}
