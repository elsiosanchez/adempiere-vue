import Cookies from 'js-cookie'

const TokenKey = 'GardenWorld Admin-token'
const currentRoleKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setCurrentrole(currentRole) {
  return Cookies.set(currentRoleKey, currentRole)
}
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
