class FetchWrapper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  getAuthHeader() {
    if (localStorage.getItem('access_token')) {
      return {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      }
    }
    return {}
  }

  async get(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      credentials: 'include',
      ...this.getAuthHeader(),
    })
    return response
  }

  async put(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      credentials: 'include',
    })
    return response
  }

  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      credentials: 'include',

    })
    return response
  }

  async patch(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      credentials: 'include',
    })
    return response
  }

  async delete(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      ...this.getAuthHeader(),
    })
    return response
  }
}

export const api = new FetchWrapper(
  import.meta.env.VITE_API_URL ?? 'https://localhost',
)
