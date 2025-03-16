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
  return api.get(`/api/users/user/${displayName}`).then(response => response.json().then(json => {
    if (!response.ok) {
      throw new Error(json.error || 'Unknown error occurred');
    }
    return json;
  }))
  .catch(error => {
    console.error("Error fetching profile:", error);
    throw error;
  });
}

function changeProfile(user, data) {
  console.log(data);
  return api.patch(`/api/users/update/`, data).then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.error || 'Unknown error occurred')
      })
    }
    return response.json()
  })
}

export const userApi = {
  login,
  register,
  passwordReset,
  getSecretQuestion,
  deleteAccount,
  getProfile,
  changeProfile,
}
