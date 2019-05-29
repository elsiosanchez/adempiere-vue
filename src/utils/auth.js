import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const currentroleKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setCurrentrole(currentrole) {
  return Cookies.set(currentroleKey, currentrole)
}
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

