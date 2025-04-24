import '@/scss/styles.scss'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'
import { useBanner } from '@/js/hooks/useBanner'

export const UserProfile = () => {
  const { showInfoBanner, showWarningBanner, showErrorBanner, banners } =
    useBanner()
  const [isEditing, setIsEditing] = Teact.useState(false)
  const [userData, setUserData] = Teact.useState(null)
  let changeUserName = ''

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
        return
      }
      const data = await response.json()
      setUserData(prevUserData => ({
        ...prevUserData,
        avatar_path: data.avatar_path,
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
          console.log(data)
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
          Teact.createElement('img', {
            src: `${userData.avatar_path}?${new Date().getTime()}`,
            className: 'img-fluid avatar',
            alt: 'Avatar',
          }),
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
      Teact.createElement('p', null, `フレンド${userData.num_of_friends}人`),
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
    const userName = window.location.pathname.split('/').filter(Boolean).pop()
    userApi
      .getProfile(userName)
      .then(response => {
        if (response.status === 404) {
          showErrorBanner({
            message: 'User not found',
            onClose: () => {},
          })
          return
        } else if (response.status === 401) {
          showErrorBanner({
            message: 'Unauthorized',
            onClose: () => {},
          })
          return
        } else if (response.status === 200) {
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
  }, [])

  if (!userData) {
    return HeaderWithTitleLayout(
      ...banners,
      Teact.createElement('p', null, 'Loading...'),
    )
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
