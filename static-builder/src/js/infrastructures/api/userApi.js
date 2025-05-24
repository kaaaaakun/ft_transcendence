import { api } from '@/js/infrastructures/api/fetch'

function login(data) {
  return api.post('/api/auth/login/', data).then(response => {
    return response
  })
}

function register(data) {
  return api.post('/api/users/', data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json().then(data => {
      return data
    })
  })
}

function passwordReset(data) {
  return api.post('/api/auth/password-reset/', data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json()
  })
}

function getSecretQuestion(data) {
  return api
    .post('/api/auth/password-reset/secret-question/', data)
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.error || 'Unknown error occurred')
        })
      }
      return response.json()
    })
}

function deleteAccount(data) {
  return api.delete('/api/users/', data).then(response => {
    return response
  })
}

function getProfile(displayName) {
  return api.get(`/api/users/user/${displayName}`).then(response => {
    return response
  })
}

function changeProfile(data) {
  return api.patch('/api/users/update/', data).then(response => {
    return response
  })
}

function getFriendsList(id) {
  return api.get(`/api/users/${id}/friends`).then(response => {
    return response
  })
}

function getFriendRequests(id) {
  return api.get(`/api/users/${id}/friend_requests`).then(response => {
    return response
  })
}

function friendRequest(friendId) {
  return api.post(`/api/users/friends/${friendId}`).then(response => {
    return response
  })
}

function acceptFriendRequest(friendId) {
  return api.post(`/api/users/friends/${friendId}`).then(response => {
    return response
  })
}

function rejectFriendRequest(friendId) {
  return api.delete(`/api/users/friends/${friendId}`).then(response => {
    return response
  })
}

function deleteFriend(friendId) {
  return api.delete(`/api/users/friends/${friendId}`).then(response => {
    return response
  })
}

function getCurrentUser() {
  return api.get('/api/auth/current-user/').then(response => {
    return response
  })
}

export const userApi = {
  login,
  register,
  passwordReset,
  getSecretQuestion,
  deleteAccount,
  getCurrentUser,

  getProfile,
  changeProfile,

  getFriendsList,
  getFriendRequests,

  friendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
}
