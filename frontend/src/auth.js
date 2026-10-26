export function getUsuario() {
  try {
    return JSON.parse(
      localStorage.getItem('eletrodex_usuario') || 'null'
    )
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem('eletrodex_token')
  )
}

export function saveSession(data) {
  localStorage.setItem(
    'eletrodex_token',
    data.token
  )

  localStorage.setItem(
    'eletrodex_usuario',
    JSON.stringify(data.usuario)
  )
}

export function logout() {
  localStorage.removeItem('eletrodex_token')
  localStorage.removeItem('eletrodex_usuario')
}