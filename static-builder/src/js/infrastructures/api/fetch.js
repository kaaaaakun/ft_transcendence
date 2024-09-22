class FetchWrapper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async get(url) {
    const response = await fetch(`${this.baseUrl}${url}`)
    return response
  }

  async put(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  }

  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  }

  async patch(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : {},
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  }

  async delete(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
    })
    return response
  }
}

export const api = new FetchWrapper(
  import.meta.env.VITE_API_URL ?? 'http://localhost',
)
